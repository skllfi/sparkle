import { useEffect, useState } from "react";
import Modal from "@/components/ui/modal.jsx";
import Button from "@/components/ui/button.jsx";
import { toast } from "react-toastify";
import { invoke } from "@/lib/electron";
import data from "../../../../package.json";

export default function FirstTime() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const firstTime = localStorage.getItem("firstTime");
    if (!firstTime || firstTime === "true") {
      const timer = setTimeout(() => setOpen(true), 20);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGetStarted = async () => {
    localStorage.setItem("firstTime", "false");
    setOpen(false);

    const toastId = toast.info(
      "Creating restore point... Please wait before applying tweaks.",
      {
        autoClose: false,
        isLoading: true,
        closeOnClick: false,
        draggable: false,
      },
    );

    try {
      await invoke({ channel: "create-sparkle-restore-point" });

      toast.update(toastId, {
        render: "Restore point created!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(toastId, {
        render: "Failed to create restore point.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error("Error creating restore point:", err);
    }
  };

  const handleSkipRestorePoint = () => {
    localStorage.setItem("firstTime", "false");
    setOpen(false);
  };

  return (
    <Modal open={open}>
      <div className="bg-sparkle-card border border-sparkle-border rounded-2xl p-8 shadow-2xl max-w-lg w-full mx-4 flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold text-sparkle-text mb-4">
          Welcome to Sparkle
        </h1>

        <p className="text-sparkle-text-secondary mb-6">
          It looks like this is your first time here. <br />
          Would you like to create a restore point before you start?
        </p>

        <p className="text-sparkle-text-secondary mb-4 text-sm">
          <span className="font-medium">
            By clicking <strong>Yes</strong>, Sparkle will create a restore
            point and disable the cooldown for future restore points.
          </span>
        </p>

        <p className="text-sparkle-text-secondary mb-4 text-sm">
          Please only download from <strong>GitHub</strong>,{" "}
          <strong>parcoil.com</strong>, or <strong>getsparkle.net</strong>.
        </p>

        <p className="text-red-500 mb-8 text-sm">
          If you download from any other source, this may be malware. Please
          uninstall and reinstall from{" "}
          <a
            href="https://getsparkle.net"
            target="_blank"
            className="text-blue-500"
          >
            getsparkle.net
          </a>
          ,{" "}
          <a
            href="https://github.com/Parcoil/Sparkle"
            target="_blank"
            className="text-blue-500"
          >
            our GitHub
          </a>
          , or{" "}
          <a
            href="https://parcoil.com"
            target="_blank"
            className="text-blue-500"
          >
            parcoil.com
          </a>
          .
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button onClick={handleGetStarted}>Yes (Recommended)</Button>
          <Button onClick={handleSkipRestorePoint} variant="danger">
            No (Not Recommended)
          </Button>
        </div>

        <p className="text-sparkle-text-secondary mt-4 text-sm">
          <span className="font-semibold">Sparkle Version:</span>{" "}
          {data?.version || "Error fetching version"}
        </p>
      </div>
    </Modal>
  );
}
