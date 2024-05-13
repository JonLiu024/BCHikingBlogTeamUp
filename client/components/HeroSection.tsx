import React from 'react'

const HeroSection = () => {
  return (
    <div className='relative text-white'>
        {/** Background video */}
        <div className='bg-cover bg-center h-screen' >
            <video autoPlay loop playsInline muted className='absolute w-auto min-w-full min-h-full max-w-none'>
                <source src="/homepage video.mp4" type='video/mp4'/>
            </video>
            {/* overlay */}
            <div className='bg-transparent flex flex-col justify-center items-center'>
                <h1 className='font-bold'>Explore the Beautiful British Columbia</h1>
                <div className='flex gap-4'>
                    <button className='py-2 px-1 bg-blue-500 hover:bg-yellow-500 text-black font-bold italic'>Explore</button>
                    <button className='py-1 px-1 bg-blue-500 hover:bg-yellow-500 text-black font-bold italic'>Learn More</button>
                </div>
                
                
            </div>

        </div>
      
    </div>
  )
}

export default HeroSection
