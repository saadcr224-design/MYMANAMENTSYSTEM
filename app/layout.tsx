import './globals.css';
import AuthGate from './AuthGate';
import {InstallProvider} from './InstallApp';
export const viewport={themeColor:'#101329'};
export const metadata={appleWebApp:{capable:true,title:'SchoolLedger',statusBarStyle:'default'},icons:{apple:'/icon-192.png'},title:'SchoolLedger · School Fee Management',description:'Your school finances, clearly in focus. Student records, fee collection and financial reporting.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><InstallProvider><AuthGate>{children}</AuthGate></InstallProvider></body></html>}
