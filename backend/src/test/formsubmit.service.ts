require("isomorphic-fetch");

const otpGen = require("otp-generator");
const url = "https://formsubmit.co/ajax/yelpoeayahaya@gmail.com";



async function submitForm() {
  const otp = otpGen.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  const data = {
    name: "Password reset",
    message: "reset you password below ",
    otp: otp,
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Check if the response is okay (status in the range 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the function to submit the form
submitForm();
