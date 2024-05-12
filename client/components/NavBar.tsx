import React from 'react'
import Image from 'next/image'
const NavBar = () => {
  return (
    <div className='flex p-3 px-10 justify-between border-b-[3px] shawdown-md bg-blue-400'>
        <div className='flex items-center logo-button-gap'>
            <Image src='/NavBar Logo.png'
            alt = 'logo' 
            width={100}
            height={80} className='rounded'/>
            <div className='hidden md:flex gap-6 items-center justify-end'> {/** this div element should aligh to the right*/}
                <h2 className='p-1 rounded-medium hover:bg-purple-50
                cursor-pointer transition-all'>Experience</h2>
                <h2 className='p-1 rounded-medium hover:bg-purple-50
                cursor-pointer transition-all'>Filtering Tool</h2>
                <h2 className='p-1 rounded-medium hover:bg-purple-50
                cursor-pointer transition-all'>Search</h2>
                <h2 className='p-1 rounded-medium hover:bg-purple-50
                cursor-pointer transition-all'>Log in</h2>
            </div>
        </div>
        
      
    </div>
  )
}

export default NavBar
