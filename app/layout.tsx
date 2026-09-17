import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'MineVault — World Journal',description:'Every world has a story. Keep yours. A personal journal for your Minecraft worlds.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
