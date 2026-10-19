package app.minevault;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.fabricmc.fabric.api.client.rendering.v1.HudRenderCallback;
import net.minecraft.advancement.AdvancementEntry;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.texture.NativeImage;
import net.minecraft.client.util.InputUtil;
import net.minecraft.client.util.ScreenshotRecorder;
import net.minecraft.text.Text;
import net.minecraft.util.math.BlockPos;
import org.lwjgl.glfw.GLFW;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** All capture activity runs on the Minecraft client, with no network traffic. */
public final class MineVaultClient implements ClientModInitializer {
    private static final ArrayDeque<Moment> PENDING = new ArrayDeque<>();
    private static final long PROMPT_DURATION_MS = 90_000;
    private static KeyBinding saveKey;
    private static KeyBinding skipKey;

    @Override
    public void onInitializeClient() {
        saveKey = KeyBindingHelper.registerKeyBinding(
            new KeyBinding("key.minevault.save", InputUtil.Type.KEYSYM, GLFW.GLFW_KEY_J, "category.minevault"));
        skipKey = KeyBindingHelper.registerKeyBinding(
            new KeyBinding("key.minevault.skip", InputUtil.Type.KEYSYM, GLFW.GLFW_KEY_K, "category.minevault"));

        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            if (client.player == null || client.world == null) {
                PENDING.clear();
                return;
            }
            while (!PENDING.isEmpty() && System.currentTimeMillis() - PENDING.peek().createdMs() > PROMPT_DURATION_MS) {
                PENDING.remove();
            }
            while (saveKey.wasPressed()) {
                if (!PENDING.isEmpty()) save(client, PENDING.remove());
            }
            while (skipKey.wasPressed()) {
                if (!PENDING.isEmpty()) {
                    PENDING.remove();
                    client.player.sendMessage(Text.literal("MineVault: skipped. No files were saved."), true);
                }
            }
        });

        HudRenderCallback.EVENT.register((context, tickCounter) -> {
            MinecraftClient client = MinecraftClient.getInstance();
            if (client.player == null || client.world == null || client.options.hudHidden || PENDING.isEmpty()) return;
            Moment moment = PENDING.peek();
            int width = client.getWindow().getScaledWidth();
            int x = Math.max(4, width - 254);
            context.fill(x, 8, width - 8, 62, 0xD91B232B);
            context.drawText(client.textRenderer, "MINEVAULT | New Moment", x + 9, 16, 0xFFDEBA74, true);
            context.drawText(client.textRenderer, shorten(moment.title(), 32), x + 9, 29, 0xFFFFFFFF, true);
            context.drawText(client.textRenderer, "[J] Save Moment    [K] Skip", x + 9, 45, 0xFFDBE4E8, true);
        });
    }

    /** Only advancement toast events are detected in this beta. */
    public static void offer(AdvancementEntry advancement) {
        MinecraftClient client = MinecraftClient.getInstance();
        if (client.player == null || client.world == null) return;
        var display = advancement.value().display();
        if (display.isEmpty()) return;

        BlockPos pos = client.player.getBlockPos();
        List<String> online = new ArrayList<>();
        if (client.getNetworkHandler() != null) {
            client.getNetworkHandler().getPlayerList().forEach(p -> {
                if (online.size() < 100) online.add(p.getProfile().getName());
            });
        }
        String worldName = client.getCurrentServerEntry() == null
            ? "Singleplayer" : client.getCurrentServerEntry().address;

        PENDING.add(new Moment(
            UUID.randomUUID().toString(), advancement.id().toString(), display.get().getTitle().getString(),
            Instant.now().toString(), client.player.getGameProfile().getName(), worldName,
            client.world.getRegistryKey().getValue().toString(),
            pos.getX(), pos.getY(), pos.getZ(),
            Math.max(0L, client.world.getTimeOfDay() / 24000L),
            client.options.getPerspective().name(), List.copyOf(online), System.currentTimeMillis()
        ));
        if (PENDING.size() > 5) PENDING.remove();
    }

    private static void save(MinecraftClient client, Moment moment) {
        Path directory = client.runDirectory.toPath().resolve("minevault").resolve("captures");
        Path png = directory.resolve(moment.id() + ".png");
        Path json = directory.resolve(moment.id() + ".json");
        try {
            Files.createDirectories(directory);
            try (NativeImage frame = ScreenshotRecorder.takeScreenshot(client.getFramebuffer())) {
                frame.writeTo(png);
            }
            String data = "{\n" +
                field("schema", "minevault.capture.v1") + ",\n" +
                field("event_id", moment.id()) + ",\n" +
                field("advancement_id", moment.advancementId()) + ",\n" +
                field("title", moment.title()) + ",\n" +
                field("occurred_at", moment.occurredAt()) + ",\n" +
                field("captured_at", Instant.now().toString()) + ",\n" +
                field("player_name", moment.playerName()) + ",\n" +
                field("world", moment.worldName()) + ",\n" +
                field("dimension", moment.dimension()) + ",\n" +
                "\"x\": " + moment.x() + ",\n" +
                "\"y\": " + moment.y() + ",\n" +
                "\"z\": " + moment.z() + ",\n" +
                "\"minecraft_day\": " + moment.minecraftDay() + ",\n" +
                field("perspective", moment.perspective()) + ",\n" +
                "\"players_online\": [" + String.join(",", moment.playersOnline().stream().map(MineVaultClient::quote).toList()) + "],\n" +
                field("screenshot", png.getFileName().toString()) + "\n}\n";
            Files.writeString(json, data, StandardCharsets.UTF_8);
            client.player.sendMessage(Text.literal("MineVault saved! Import JSON + PNG from .minecraft/minevault/captures."), false);
        } catch (IOException | RuntimeException ex) {
            client.player.sendMessage(Text.literal("MineVault capture failed: " + ex.getMessage()), false);
        }
    }

    private static String field(String key, String value) {
        return quote(key) + ": " + quote(value);
    }

    private static String quote(String input) {
        StringBuilder out = new StringBuilder("\"");
        for (int i = 0; i < input.length(); i++) {
            char ch = input.charAt(i);
            switch (ch) {
                case '"' -> out.append("\\\"");
                case '\\' -> out.append("\\\\");
                case '\n' -> out.append("\\n");
                case '\r' -> out.append("\\r");
                case '\t' -> out.append("\\t");
                default -> {
                    if (ch < 32) out.append(String.format("\\u%04x", (int) ch));
                    else out.append(ch);
                }
            }
        }
        return out.append('"').toString();
    }

    private static String shorten(String value, int max) {
        return value.length() > max ? value.substring(0, max - 1) + "…" : value;
    }

    private record Moment(
        String id, String advancementId, String title, String occurredAt, String playerName,
        String worldName, String dimension, int x, int y, int z, long minecraftDay,
        String perspective, List<String> playersOnline, long createdMs
    ) {}
}
