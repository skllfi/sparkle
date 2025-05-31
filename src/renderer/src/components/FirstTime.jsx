import React from 'react'

function FirstTime() {
  const handleGetStarted = () => {
    localStorage.setItem('firstTime', 'false')
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="text-center p-8 max-w-md bg-slate-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-4">Welcome to Sparkle</h1>
        <p className="text-gray-400">Your first time here? Let's get started!</p>
        <button
          className="mt-6 px-4 py-2 bg-sparkle-primary text-white rounded-lg hover:bg-sparkle-secondary transition duration-200"
          onClick={handleGetStarted}
        >
          Get Started
        </button>
      </div>
    </div>
  )
}

export default FirstTime
