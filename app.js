const dropdownListContainers = document.querySelectorAll(".dropdown-list");
const dropdownListArrows = document.querySelectorAll(".dropdown-arrow");

dropdownListArrows.forEach((arrow) => {
  arrow.addEventListener("click", (e) => {
    const displayBox = e.target.closest(".dropdown-display");
    const dropdownList = displayBox.nextElementSibling;
    dropdownList.classList.toggle("hide-dropdown");
  });
});

const tracksOfInterest = [
  "Dev / Software Engineering",
  "AI",
  "Design/ UI-UX",
  "DevOps Engineer/ Site Reliability Engineering",
  "Security/ Cybersecurity",
  "Project Management",
  "Machine Learning",
  "Technical Writing",
  "Career Growth/ Developer Journey",
  "Open Source Contributions",
  "AR/VR",
  "Starting a Tech Startup",
  "Public Speaking/ Developer Advocacy",
  "Other",
];

const roles = [
  "Software Engineer",
  "UX Designer",
  "Product Manager",
  "Student",
  "Startup Founder",
  "Data Analyst",
  "DevOps Engineer",
  "Not in Tech Yet",
  "Other",
];

const interestListContainer = document.querySelector(".interest-list");
const rolesListContainer = document.querySelector(".input-grid");

const formValid = false;

window.addEventListener("DOMContentLoaded", (e) => {
  interestListContainer.innerHTML = tracksOfInterest
    .map((item, index) => {
      return `
    <label for="tracks-interest-${index}">
      <input type="checkbox" id="tracks-interest-${index}" name="tracks_of_interest" value="${item}" />
      ${item}
    </label>
  `;
    })
    .join(" ");

  rolesListContainer.innerHTML = roles
    .map((role, index) => {
      return `<label for="track-role-${index}">
      <input type="checkbox" id="track-role-${index}" name="occupation" value="${role}" />
      ${role}
    </label>`;
    })
    .join(" ");

  handleCheckboxGroup(".input-grid");
  handleCheckboxGroup(".interest-list");
  validateForm();
});

document.querySelectorAll(".dropdown").forEach((dropdown) => {
  const displayInput = dropdown.querySelector(".dropdown-display .input");
  const displayHiddenInput = dropdown.querySelector(".dropdown-display input");
  const dropdownList = dropdown.querySelector(".dropdown-list");

  dropdownList.addEventListener("click", (e) => {
    if (e.target.tagName === "P") {
      const value = e.target.textContent.trim();
      displayInput.textContent = value;
      displayInput.style.color = "#000";
      displayHiddenInput.value = e.target.dataset.value;
      dropdownList.classList.add("hide-dropdown");
      [...dropdownList.children].forEach((child) =>
        child.classList.remove("active")
      );
      e.target.classList.add("active");
      validateForm();
    }
  });
});

const formState = {
  occupation: [],
  tracks_of_interest: [],
};

function handleCheckboxGroup(containerSelector) {
  const container = document.querySelector(containerSelector);
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const otherInput = container.nextElementSibling;
  const groupName = checkboxes[0]?.name;

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const value = e.target.value;

      if (value === "Other") {
        if (checkbox.checked) {
          otherInput.disabled = false;
          otherInput.classList.remove("input-disabled");
          otherInput.required = true;
          otherInput.focus();

          otherInput.oninput = () => {
            updateGroup(groupName, `Other: ${otherInput.value.trim()}`, true);
          };
        } else {
          otherInput.disabled = true;
          otherInput.classList.add("input-disabled");
          otherInput.required = false;
          updateGroup(groupName, null, true);
          otherInput.value = "";
        }
      } else {
        if (checkbox.checked) {
          updateGroup(groupName, value, false);
        } else {
          removeFromGroup(groupName, value);
        }
      }

      console.log(formState);
      validateForm();
    });
  });
}

function updateGroup(name, value, isOther = false) {
  formState[name] = formState[name].filter((item) => {
    if (isOther) return !item.startsWith("Other:");
    return item !== value;
  });

  if (value) {
    formState[name].push(value);
  }
}

function removeFromGroup(name, value) {
  formState[name] = formState[name].filter((item) => item !== value);
}

const submitBtn = document.querySelector(".submit-btn");
const errorMsg = document.querySelector(".error-msg");
const mainForm = document.querySelector(".main-form");

function validateForm() {
  const isRequiredFilled = [...mainForm.querySelectorAll("[required]")].every(
    (input) => input.value.trim() !== ""
  );

  const hasTrack = formState.tracks_of_interest.length > 0;
  const hasOccupation = formState.occupation.length > 0;

  const isValid = isRequiredFilled && hasTrack && hasOccupation;

  if (!isValid) {
    errorMsg.classList.remove("hide");
  } else {
    errorMsg.classList.add("hide");
  }

  submitBtn.disabled = !isValid;
}

mainForm.addEventListener("input", validateForm);

mainForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(e.target);
  const dataObject = Object.fromEntries(data.entries());
  dataObject.tracks_of_interest = formState.tracks_of_interest;
  dataObject.occupation = formState.occupation;

  submitBtn.innerHTML = `<div class="submit-wrapper">Submitting...</div>`;
  submitBtn.disabled = true;
  fetch("https://sapphire-1013705579431.europe-west3.run.app/api/waitlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataObject),
  })
    .then((response) => {
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) {
        if (contentType.includes("application/json")) {
          return response.json().then((data) => {
            if (data.errors) {
              let messages = Object.values(data.errors);
              messages = messages.join("</br>");

              throw new Error(messages);
            }
            throw new Error(data.message || "Unknown server error");
          });
        } else {
          return response.text().then((text) => {
            throw new Error(text || "Unknown server error");
          });
        }
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:");
      document.querySelectorAll(".success-form-body").forEach((container) => {
        container.classList.remove("hide");
      });

      if (window.innerWidth < 760) {
        document.querySelector(".main-form-body").classList.add("hide");
      } else {
        document.querySelector(".main-form-body").classList.remove("hide");
      }
    })
    .catch((error) => {
      errorMsg.innerHTML = error.message;
      errorMsg.classList.remove("hide");
    })
    .finally(() => {
      submitBtn.innerHTML = `<div class="submit-wrapper">Submit</div>`;
      submitBtn.disabled = false;
    });
});

document.querySelector(".submit-wrapper").addEventListener("click", (e) => {
  if (submitBtn.disabled) {
    const isValid = validateForm();

    const requiredInputs = [...mainForm.querySelectorAll("[required]")];
    requiredInputs.forEach((input) => {
      if (input.value.trim() === "") {
        input.closest(".main-input").classList.add("input-error");
      } else {
        input.closest(".main-input").classList.remove("input-error");
      }
    });

    if (
      formState.tracks_of_interest.length === 0 ||
      formState.occupation.length === 0
    ) {
      errorMsg.classList.remove("hide");
    }
    e.preventDefault();
  }
});
