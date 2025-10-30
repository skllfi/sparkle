import { useMemo, useState, useEffect } from "react"
import { invoke } from "@/lib/electron"
import { useTranslation } from 'react-i18next';

function Greeting() {
  const { t } = useTranslation();
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
    t('greetings.hi'),
    t('greetings.hello'),
    t('greetings.hey'),
    t('greetings.greetings'),
    t('greetings.yo'),
    t('greetings.howdy'),
    t('greetings.whats_up'),
    t('greetings.good_to_see_you'),
    t('greetings.welcome_back'),
    t('greetings.ahoy'),
  ];

  const timeGreetings = () => {
    const hour = new Date().getHours()
    if (hour < 12) return [t('greetings.good_morning')];
    if (hour < 18) return [t('greetings.good_afternoon')];
    return [t('greetings.good_evening')];
  }

  const randomGreeting = useMemo(() => {
    const allGreetings = [...generalGreetings, ...timeGreetings()]
    return allGreetings[Math.floor(Math.random() * allGreetings.length)]
  }, [t])

  return (
    <h1 className="text-2xl font-bold mb-4">
      {randomGreeting}, <span className="text-sparkle-primary">{name || t('friend')}</span>
    </h1>
  )
}

export default Greeting
