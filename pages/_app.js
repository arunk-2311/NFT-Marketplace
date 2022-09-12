import Link from 'next/link'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Metaverse MarketPlace</p>
        <div className="flex mt-4">
          <Link href='/'>
            <a className="mr-6 text-pink-500">Home</a>
          </Link>
          <Link href='/createItem'>
            <a className="mr-6 text-pink-500">Sell Assets</a>
          </Link>          
          <Link href='/myAssets'>
            <a className="mr-6 text-pink-500">My Assets</a>
          </Link>          
          <Link href='/creatorDashboard'>
            <a className="mr-6 text-pink-500">Creater Dashboard</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
