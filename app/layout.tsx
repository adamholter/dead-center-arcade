import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Dead Center',description:'Only shoot toward the center. Dodge your own ricochets. A pixel arcade game inspired by mors’s pico1k game.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
