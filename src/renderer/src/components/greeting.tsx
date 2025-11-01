import React, { useState, useEffect, useMemo } from "react";
import { invoke } from "@/lib/electron";
import { useTranslation } from "react-i18next";

function Greeting(): React.ReactElement {
  const { t } = useTranslation();
  const [name, setName] = useState<string>(
    localStorage.getItem("sparkle:user") || "",
  );
  const [randomGreeting, setRandomGreeting] = useState<string>("");

  useEffect(() => {
    if (!name) {
      (invoke({ channel: "get-user-name" }) as Promise<string>)
        .then((username) => {
          if (username) {
            setName(username);
            localStorage.setItem("sparkle:user", username);
          }
        })
        .catch((err) => {
          console.error("Error fetching user name:", err);
        });
    }
  }, [name]);

  const generalGreetings = useMemo(
    () => [
      t("greetings.hi"),
      t("greetings.hello"),
      t("greetings.hey"),
      t("greetings.greetings"),
      t("greetings.yo"),
      t("greetings.howdy"),
      t("greetings.whats_up"),
      t("greetings.good_to_see_you"),
      t("greetings.welcome_back"),
      t("greetings.ahoy"),
    ],
    [t],
  );

  const timeGreetings = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return [t("greetings.good_morning")];
    if (hour < 18) return [t("greetings.good_afternoon")];
    return [t("greetings.good_evening")];
  }, [t]);

  useEffect(() => {
    const allGreetings = [...generalGreetings, ...timeGreetings];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRandomGreeting(
      allGreetings[Math.floor(Math.random() * allGreetings.length)],
    );
  }, [generalGreetings, timeGreetings]);

  return (
    <h1 className="text-2xl font-bold mb-4">
      {randomGreeting},{" "}
      <span className="text-sparkle-primary">{name || t("friend")}</span>
    </h1>
  );
}

export default Greeting;
