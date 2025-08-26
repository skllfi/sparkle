import { useMemo, useState, useEffect } from "react"
import { invoke } from "@/lib/electron"

function Greeting() {
  const [name, setName] = useState("")

  useEffect(() => {
    const cached = localStorage.getItem("sparkle:user")
    if (cached) {
      setName(cached)
    } else {
      invoke({ channel: "get-user-name" })
        .then((username) => {
          if (username) {
            setName(username)
            localStorage.setItem("sparkle:user", username)
          }
        })
        .catch((err) => {
          console.error("Error fetching user name:", err)
        })
    }
  }, [])

  const generalGreetings = [
    "Hi",
    "Hello",
    "Hey",
    "Greetings",
    "Yo",
    "Howdy",
    "What's up",
    "Good to see you",
    "Welcome Back",
    "Ahoy",
  ]

  const timeGreetings = () => {
    const hour = new Date().getHours()
    if (hour < 12) return ["Good morning"]
    if (hour < 18) return ["Good afternoon"]
    return ["Good evening"]
  }

  const randomGreeting = useMemo(() => {
    const allGreetings = [...generalGreetings, ...timeGreetings()]
    return allGreetings[Math.floor(Math.random() * allGreetings.length)]
  }, [])

  return (
    <h1 className="text-2xl font-bold mb-4">
      {randomGreeting}, <span className="text-sparkle-primary">{name || "friend"}</span>
    </h1>
  )
}

export default Greeting
