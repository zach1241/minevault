'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="loading-vault"><h1>We lost our place.</h1><p>Your saved memories are safe. Please try opening your vault again.</p><button className="button primary" onClick={reset}>Try again</button></main>}
