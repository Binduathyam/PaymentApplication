const sendToBackend = async (uri: string) => {
  try {
    const formData = new FormData();
    formData.append("audio", {
      uri,
      name: "recording.m4a",
      type: "audio/m4a",
    } as any);

    const response = await fetch("http://172.23.4.188:5000/stt", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const text = await response.text();
    console.log("RAW RESPONSE:", text);

    const data = JSON.parse(text);

    if (data.status === "success") {
      console.log("Recognized:", data.text);
      const numbersOnly = data.text.replace(/\D/g, "");
      setPhone(numbersOnly);
    } else {
      console.log("Backend error:", data.message);
    }

  } catch (error) {
    console.log("STT error:", error);
  }
};
