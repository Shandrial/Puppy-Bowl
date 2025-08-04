// cohort code
const COHORT = "2503-FTB-ET-WEB-AM";
// API URL
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${COHORT}/players`;

// place holder for players
const state = {
  puppies: [],
  currentPuppy: {},
};

const $selectPuppyContainer = document.getElementById(
  "selected-puppy-container"
);

const selectPuppy = async () => {
  // get the event from the hash
  getEventFromHash();

  // clear the container
  $selectPuppyContainer.innerHTML = "";

  // if there is no current puppy, return
  if (!state.currentPuppy) {
    $selectPuppyContainer.innerHTML = "<p>No puppy selected</p>";
  }
  await getPuppyData(state.currentPuppy);
  // get the puppy data
};

const getEventFromHash = () => {
  const id = window.location.hash.slice(1);

  state.currentPuppy = state.puppies.find((puppy) => {
    return puppy.id === +id;
  });
};

window.addEventListener("hashchange", selectPuppy);

//fetch all players from api
const fetchAllPuppies = async () => {
  try {
    const response = await fetch(API_URL);
    const { data } = await response.json();
    state.puppies = data.players;
    renderPuppies();
  } catch (error) {
    console.log(error);
  }
};

//render puppies
const renderPuppies = () => {
  const puppiesContainer = document.getElementById("puppy-list-container");
  const puppyList = state.puppies;

  //checks if there are puppies to display
  if (puppyList.length === 0 || !puppyList) {
    puppiesContainer.innerHTML = "<p>No puppies available</p>";
    return;
  }

  puppyList.forEach((puppy) => {
    const puppyListCard = document.createElement("div");
    puppyListCard.classList.add("puppy-list-card");
    puppyListCard.innerHTML = `
      <a href = #${puppy.id}>${puppy.name}</a>`;

    puppiesContainer.appendChild(puppyListCard);
  });
};

const getPuppyData = async (puppy) => {
  try {
    const response = await fetch(`${API_URL}/${puppy.id}`);
    const { data } = await response.json();

    //resets current puppy data
    state.currentPuppy = {};

    const info = {
      id: data.player.id,
      name: data.player.name,
      breed: data.player.breed,
      age: data.player.age,
      imageUrl: data.player.imageUrl,
      description: data.player.description,
    };
    state.currentPuppy = info;

    makePuppyCard();
  } catch (error) {
    console.log(error);
  }
};

const makePuppyCard = () => {
  // create each element for the cards

  const { name, breed, imageUrl } = state.currentPuppy;
  const puppyCard = document.createElement("div");
  const nameh3 = document.createElement("h2");
  const breedP = document.createElement("p");
  const stat = document.createElement("p");
  const image = document.createElement("img");
  const btn = document.createElement("button");
  console.log(state.currentPuppy);

  //add id to each element
  puppyCard.id = "puppyCard";
  nameh3.id = "name";
  breedP.id = "breed";
  stat.id = "status";
  image.id = "image";
  btn.id = "deleteButton";

  //add information to each element
  nameh3.textContent = name;
  breedP.textContent = `Breed: ${breed}`;
  image.src = imageUrl;
  image.alt = `${name} the ${breed}`;
  btn.textContent = "Delete";

  //add all info to and element array
  const elements = [nameh3, breedP, stat, image, btn];

  elements.forEach((element) => {
    puppyCard.appendChild(element);
  });

  // append the puppy card to the container
  $selectPuppyContainer.appendChild(puppyCard);
  return $selectPuppyContainer;
};

// create event listender to handle the delete button
window.addEventListener("click", async (event) => {
  // delete puppy
  if (event.target.id === "deleteButton") {
    const puppyId = state.currentPuppy.id;
    try {
      const response = await fetch(`${API_URL}/${puppyId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete the puppy");
      }
      // remove the puppy from the state
      state.puppies = state.puppies.filter((puppy) => puppy.id !== puppyId);
      // reset current puppy
      state.currentPuppy = {};
      //clear the puppy list container
      const puppiesContainer = document.getElementById("puppy-list-container");
      puppiesContainer.innerHTML = "";
      // re-render the puppies
      renderPuppies();
      // clear the selected puppy container
      $selectPuppyContainer.innerHTML = "<p>Puppy deleted successfully</p>";
    } catch (error) {
      console.error(error);
    }
  }
});

//create function to handle adding a new puppy
const addNewPuppy = async (name, breed, status, imageUrl) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        breed,
        status,
        imageUrl,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add new puppy");
    }

    const { data } = await response.json();
    state.puppies.push(data.player);
    renderPuppies();
  } catch (error) {
    console.error(error);
  }
};

// event listener for the puppy form submission
const newPuppyFormEvent = () => {
  const form = document.getElementById("puppy-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log(
      form.name.value,
      form.breed.value,
      form.status.value,
      form.imageUrl.value
    );

    // add the new puppy
    await addNewPuppy(
      form.name.value,
      form.breed.value,
      form.status.value,
      form.imageUrl.value
    );

    // reset the form
    form.reset();
  });
};
//initialize the app
const init = async () => {
  await fetchAllPuppies();
  selectPuppy();
  newPuppyFormEvent();
};

init();