'use client';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {Download,Check,X} from 'lucide-react';
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
const InstallContext=createContext<{installed:boolean;install:()=>Promise<boolean>}>({installed:false,install:async()=>false});
export function InstallProvider({children}:{children:ReactNode}){const prompt=useRef<InstallEvent|null>(null);const [installed,setInstalled]=useState(false);useEffect(()=>{const media=matchMedia('(display-mode: standalone)');const update=()=>setInstalled(media.matches||!!(navigator as Navigator&{standalone?:boolean}).standalone);update();const available=(e:Event)=>{e.preventDefault();prompt.current=e as InstallEvent};const done=()=>{prompt.current=null;setInstalled(true)};window.addEventListener('beforeinstallprompt',available);window.addEventListener('appinstalled',done);media.addEventListener('change',update);if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});return()=>{window.removeEventListener('beforeinstallprompt',available);window.removeEventListener('appinstalled',done);media.removeEventListener('change',update)}},[]);useEffect(()=>{
let disposed=false;
let reconnecting=false;
const reconnect=async()=>{
if(reconnecting||!navigator.onLine)return;
reconnecting=true;
try{
const response=await fetch('/api/auth',{cache:'no-store',credentials:'same-origin'});
if(response.ok&&!disposed)window.location.reload();
}catch{}finally{reconnecting=false}
};
window.addEventListener('online',reconnect);
return()=>{disposed=true;window.removeEventListener('online',reconnect)};
},[]);async function install(){const event=prompt.current;if(!event)return false;prompt.current=null;try{await event.prompt();await event.userChoice;return true}catch{return false}}return <InstallContext.Provider value={{installed,install}}>{children}</InstallContext.Provider>}
export default function InstallApp(){const {installed,install}=useContext(InstallContext);const dialog=useRef<HTMLDialogElement>(null);return <><button type="button" className="btn installApp" disabled={installed} onClick={async()=>{if(!await install())dialog.current?.showModal()}}>{installed?<Check size={16}/>:<Download size={16}/>}<span>{installed?'Installed':'Install App'}</span></button><dialog ref={dialog} className="installDialog" aria-labelledby="install-title"><button type="button" className="iconbtn installClose" aria-label="Close installation instructions" onClick={()=>dialog.current?.close()}><X size={20}/></button><h2 id="install-title">Install SchoolLedger</h2><p>Add SchoolLedger to your home screen or desktop.</p><ul><li><b>Android:</b> Open this site in Chrome. Tap the browser menu → Install app or Add to Home screen.</li><li><b>iPhone / iPad:</b> Open in Safari. Tap Share → Add to Home Screen → Add.</li><li><b>Windows / desktop:</b> Open in Chrome or Edge and use the address-bar install icon or browser menu → Install this site as an app.</li><li><b>Mac Safari:</b> Use File → Add to Dock when available.</li></ul><p>If installation is unavailable, open the site in a supported browser instead of an in-app browser. Your browser controls when the install prompt is available.</p><small>An internet connection is required for sign-in and school records.</small><button type="button" className="btn primary" onClick={()=>dialog.current?.close()}>Got it</button></dialog></>}
