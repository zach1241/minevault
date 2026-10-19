package app.minevault.mixin;

import app.minevault.MineVaultClient;
import net.minecraft.advancement.AdvancementEntry;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.toast.AdvancementToast;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(AdvancementToast.class)
public abstract class AdvancementToastMixin {
    @Inject(method = "<init>", at = @At("TAIL"))
    private void minevault$queue(AdvancementEntry advancement, CallbackInfo ci) {
        MinecraftClient.getInstance().execute(() -> MineVaultClient.offer(advancement));
    }
}
