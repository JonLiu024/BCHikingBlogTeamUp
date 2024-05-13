import React from 'react'
import Image from 'next/image'
const NavBar = () => {
  return (
    <div className='flex p-2 border-b-[3px] justify-between shawdown-md bg-blue-400'>
        <div className='flex items-center'>
            <Image src='/NavBar Logo.png'
            alt = 'logo' 
            width={100}
            height={80} className='rounded'/>    
        </div>
        
        <div className='hidden md:flex gap-6 items-center'> {/** this div element should aligh to the right*/}
                <button className='py-5 px-2 text-white rounded-lg hover:bg-purple-200 
                cursor-pointer transition-all'>Experience</button>
                <button className='py-5 px-2 text-white rounded-lg hover:bg-purple-200
                cursor-pointer transition-all'>Filtering Tool</button>
                <button className='py-5 px-2 text-white rounded-lg hover:bg-purple-200
                cursor-pointer transition-all'>Search</button>
                <button className='py-4 px-2 text-white border-4 rounded-sm hover:bg-purple-300
                cursor-pointer transition-all'>Log in</button>
        </div>
      
    </div>
  )
}

export default NavBar
