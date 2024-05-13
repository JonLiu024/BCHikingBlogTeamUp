import React from 'react'
import Image from 'next/image'
const NavBar = () => {
  return (
    <div className='flex p-2 px-10 border-b-[3px] justify-between shawdown-md bg-blue-400'>
        <div className='flex items-center'>
            <Image src='/NavBar Logo.png'
            alt = 'logo' 
            width={100}
            height={80} className='rounded'/>    
        </div>
        
        <div className='hidden md:flex gap-6 items-center'> {/** this div element should aligh to the right*/}
                <h2 className='p-1 rounded-lg hover:bg-purple-100
                cursor-pointer transition-all'>Experience</h2>
                <h2 className='p-1 rounded-lg hover:bg-purple-100
                cursor-pointer transition-all'>Filtering Tool</h2>
                <h2 className='p-1 rounded-lg hover:bg-purple-100
                cursor-pointer transition-all'>Search</h2>
                <h2 className='p-1 rounded-lg hover:bg-purple-100
                cursor-pointer transition-all'>Log in</h2>
        </div>
      
    </div>
  )
}

export default NavBar
