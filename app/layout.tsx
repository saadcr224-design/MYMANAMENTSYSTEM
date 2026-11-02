import './globals.css';
import AuthGate from './AuthGate';
export const metadata={title:'SchoolLedger · School Fee Management',description:'Your school finances, clearly in focus. Student records, fee collection and financial reporting.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><AuthGate>{children}</AuthGate></body></html>}
