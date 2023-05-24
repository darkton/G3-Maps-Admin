const locationButton = document.getElementById("location-button");
const profileImg = document.getElementById("profile-img");
const profileMenu = document.getElementById("profile-menu");
const logoutBtn = document.getElementById("logout-button");

const latitudeInput = document.getElementById("lat");
const longitudeInput = document.getElementById("long");

logoutBtn.addEventListener("click", function () {
  deleteCookie("__token");
  document.location.reload();
});

profileImg.addEventListener("click", function () {
  profileMenu.classList.toggle("hidden");
});

const searchButton = document.getElementById("search-btn");

searchButton.addEventListener("click", function () {
  window.location.href = "search.html";
});


var mapOptions = {
    center: [-5.087930, -42.800980],
    zoom: 17
}

var map = new L.map('map', mapOptions);

let layer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
map.addLayer(layer);

var marker = new L.Marker([-5.087930, -42.800980]);
marker.addTo(map);

locationButton.addEventListener("click", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var latitude = position.coords.latitude.toString();
            var longitude = position.coords.longitude.toString();

            var latitude = latitude.split(',').join('.');
            var longitude = longitude.split(',').join('.');
            
            latitudeInput.value = latitude;
            longitudeInput.value = longitude;

            var latLng = L.latLng(latitude, longitude);
            marker.setLatLng(latLng);
            map.panTo(latLng);

        });
    } else {
        alert("Geolocalização não suportada pelo navegador.");
    }
});

const selectElement = document.getElementById('splitter');
const listDiv = document.getElementById('id-list');

selectElement.addEventListener('change', () => {
  const value = parseInt(selectElement.value);

  if (value !== 0) {
    let items = '';

    for (let i = 1; i <= value; i++) {
      items += `
        <div class="flex space-x-3 items-center text-neutral-500">
          <p class="w-8 text-right">${i.toString().padStart(2, '0')}.</p>
          <input id="client-id-${i}" type="number" placeholder="ID"
            class="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6">
        </div>
      `;
    }

    listDiv.innerHTML = items;
  } else {
    listDiv.innerHTML = '';
  }
});

window.addEventListener("load", () => searchPOPList(), false);
window.addEventListener("load", () => getZones(), false);

const popListInput = document.getElementById("pop");

async function searchPOPList() {
    const url = host_name + "/api/v1/pop_list.php";

    try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' +  getCookie("__token")
          }
        });
      
        const resStatusCode = response.status;
      
        if (resStatusCode == 200) {
            const responseData = await response.text(); 
      
            const obj = JSON.parse(responseData);
            for(i in obj){
                    
                var z = document.createElement('option');
                z.innerHTML = obj[i]["pop_name"];
                z.setAttribute('value', obj[i]["id_pop"]);
                    
                popListInput.appendChild(z);
            }

            searchOLTList();
        } else {
            alert("Erro inesperado. Contate o administrador. Código do erro: " + resStatusCode + ".");
        }
      } catch (error) {
        console.log("An unexpected error has occurred. " + error);
      }
}

popListInput.addEventListener("change", function() {
    searchOLTList();
});

const oltListInput = document.getElementById("olt");

async function searchOLTList() {
    oltListInput.innerHTML = "";

    var z = document.createElement('option');
    z.innerHTML = "Selecionar uma OLT"; 
    z.setAttribute('value', "0");
    oltListInput.appendChild(z);

    const url = host_name + "/api/v1/olt_list.php";

    const formData = new FormData();
    formData.append("pop", oltListInput.value);

    try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' +  getCookie("__token")
          },
          body: formData
        });
      
        const resStatusCode = response.status;
      
        if (resStatusCode == 200) {
            const responseData = await response.text(); 
      
            const obj = JSON.parse(responseData);
            for(i in obj){
                    
                var z = document.createElement('option');
                z.innerHTML = obj[i]["olt_name"];
                z.setAttribute('value', obj[i]["olt_id"]);
                    
                oltListInput.appendChild(z);
            }
        } else {
            alert("Erro inesperado. Contate o administrador. Código do erro: " + resStatusCode + ".");
        }
      } catch (error) {
        console.log("An unexpected error has occurred. " + error);
      }
}

oltListInput.addEventListener("change", function() {
    searchRouteList();
});

const routeListInput = document.getElementById("route");

async function searchRouteList() {
  if (parseInt(oltListInput.value) == 0 || parseInt(oltListInput.value) == null) {
    return;
  }

    routeListInput.innerHTML = "";

    var z = document.createElement('option');
    z.innerHTML = "Selecionar uma rota"; 
    routeListInput.appendChild(z);

    const url = host_name + "/api/v1/route_list.php";

    const formData = new FormData();
    formData.append("olt", oltListInput.value);

    try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' +  getCookie("__token")
          },
          body: formData
        });
      
        const resStatusCode = response.status;
      
        if (resStatusCode == 200) {
            const responseData = await response.text(); 
      
            const obj = JSON.parse(responseData);
            for(i in obj){
                    
                var z = document.createElement('option');
                z.innerHTML = "Rota " + obj[i]["route_number"];
                z.setAttribute('value', obj[i]["route_id"]);
                    
                routeListInput.appendChild(z);
            }
        } else {
            // alert("Erro inesperado. Contate o administrador. Código do erro: " + resStatusCode + ".");
        }
      } catch (error) {
        console.log("An unexpected error has occurred. " + error);
      }
}

routeListInput.addEventListener("change", function() {
    if (!isNaN(routeListInput.value)) {
        retrieveRouteData();
    } else {
        document.getElementById("card").value = "";
        document.getElementById("pon").value = "";
    }
});

async function retrieveRouteData() {
    const url = host_name + "/api/v1/route_list.php";

    const formData = new FormData();
    formData.append("route_id", parseInt(routeListInput.value));

    try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' +  getCookie("__token")
          },
          body: formData
        });
      
        const resStatusCode = response.status;
      
        if (resStatusCode == 200) {
            const responseData = await response.text(); 
      
            const obj = JSON.parse(responseData);
            for(i in obj){
                document.getElementById("card").value = obj[i]["slot_number"];
                document.getElementById("pon").value = obj[i]["port_number"];
            }
        } else {
          // alert("Erro inesperado. Contate o administrador. Código do erro: " + resStatusCode + ".");
        }
      } catch (error) {
        console.log("An unexpected error has occurred. " + error);
      }
}

const createForm = document.getElementById("create-form");

const ctoInput = document.getElementById("cto");
const zoneSelect = document.getElementById("zone");
const zoningCheckbox = document.getElementById("zoning");

createForm.onsubmit = async (e) => {
    e.preventDefault();

    const url = host_name + "/api/v1/add_cto_2.php";

    const value = parseInt(selectElement.value);
    const inputs = {};

    for (let i = 1; i <= value; i++) {
    const inputField = document.getElementById(`client-id-${i}`);
    const inputValue = inputField.value.trim();

      if (inputValue !== '') {
          inputs[`client-id-${i}`] = inputValue;
      }
    }


    const json = JSON.stringify(inputs);

    const ctoInput = document.getElementById("cto");
    const splitterInput = document.getElementById("splitter");
    const latitudeInput = document.getElementById("lat");
    const longitudeInput = document.getElementById("long");
    const oltInput = document.getElementById("olt");
    const cardInput = document.getElementById("card");
    const ponInput = document.getElementById("pon");
    const signalInput = document.getElementById("signal");
    const netSplitter = document.getElementById("net-splitter");
    const balanceInput = document.getElementById("balance");

    const formData = new FormData();
    formData.append("olt", oltInput.value);
    formData.append("card", cardInput.value);
    formData.append("pon", ponInput.value);
    formData.append("signal", signalInput.value);
    formData.append("lat", latitudeInput.value);
    formData.append("long", longitudeInput.value);
    formData.append("splitter", splitterInput.value);
    formData.append("dist_splitter", netSplitter.value);
    formData.append("balance", balanceInput.value);
    formData.append("client_ids", json);
    formData.append("images", getAllImg());

    if (zoningCheckbox.checked) { 
      if(zoneSelect.value == "0") {
        alert("Você precisa selecionar uma zona.");

        return;
      }

      formData.append("zone", zoneSelect.value);
    } else {
      if (ctoInput.value !== "") {
        formData.append("cto", ctoInput.value);
      }
      if(zoneSelect.value !== "0") {
        formData.append("zone", zoneSelect.value);
      }
    }

    try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' +  getCookie("__token")
          },
          body: formData
        });
      
        const resStatusCode = response.status;
      
        if (resStatusCode == 200 || resStatusCode == 201 || resStatusCode == 206) {
            const responseData = await response.text(); 

            alert("CTO adicionada com sucesso.");

            window.location.href = '/index.html';
        } else {
          alert("Erro inesperado. Contate o administrador. Código do erro: " + resStatusCode + ".");
        }
    } catch (error) {
      console.log("An unexpected error has occurred. " + error);
    }
}

const uploadDiv = document.getElementById('upload-img-container');

uploadDiv.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDiv.classList.add('border-gray-700');
});

uploadDiv.addEventListener('dragleave', () => {
    uploadDiv.classList.remove('border-gray-700');
});

uploadDiv.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadDiv.classList.remove('border-gray-700');
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();

    if (file) {
        reader.readAsDataURL(file);
    } else {
        
    }
});

const imageGrid = document.getElementById('image-grid');
const imageContainer = document.getElementById('image-container');
const imageInput = document.getElementById('file-upload');

function createImageElement(imageSrc) {
  const imageElement = `<div class="relative" id="image-block">
  <img class="w-full h-full object-cover rounded-lg" src="${imageSrc}"></img>
  <button onclick="deleteImg(this)" type="button" class="top-0 right-0 absolute mt-1 mr-1 w-6 h-6 justify-center rounded-md text-sm font-semibold leading-6 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 m-auto">
      <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
    </svg>                  
  </button>
</div>`;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = imageElement;
  return tempDiv.firstChild;
}

function addNewImage(imageSrc) {
  const newImageElement = createImageElement(imageSrc);
  imageContainer.appendChild(newImageElement);
}

const imageSpin = document.getElementById('spin');
const submitButton = document.getElementById('submit-btn');

imageInput.addEventListener('change', async (e) => {
  const url = host_name + "/api/v1/upload_image.php";

  submitButton.disabled = true;
  imageSpin.style.display = "block";

  const selectedImage = imageInput.files[0];
  const formData = new FormData();
  formData.append('file', selectedImage);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' +  getCookie("__token")
      },
      body: formData
    });
  
    const resStatusCode = response.status;
  
    if (resStatusCode == 200 || resStatusCode == 201) {
        const responseData = await response.text(); 

        const obj = JSON.parse(responseData);
        for(i in obj){
          addNewImage(obj[i]["image_url"]);
        }
    } else {
      alert("Erro inesperado. Contate o administrador. Código do erro: " + resStatusCode + ".");
    }
} catch (error) {
  console.log("An unexpected error has occurred. " + error);
}

  submitButton.disabled = false;
  imageSpin.style.display = "none";
});

function deleteImg(button) {
  var imageBlock = button.parentNode;
  imageBlock.parentNode.removeChild(imageBlock);
}

function getAllImg() {
  const imageContainer = document.getElementById("image-container");

  const images = imageContainer.getElementsByTagName("img");
  const imageUrls = [];

  for (let i = 0; i < images.length; i++) {
    const url = images[i].getAttribute("src");
    imageUrls.push(url);
  }

  const json = JSON.stringify(imageUrls);


  return json;
}

zoningCheckbox.addEventListener("change", () => {
  if (zoningCheckbox.checked) {
    ctoInput.value = "";
    ctoInput.disabled = true;
    ctoInput.style.display = "none";
  } else {
    ctoInput.disabled = false;
    ctoInput.style.display = "block";
  }
});

zoningCheckbox.checked = true;
const eventCk = new Event("change");
zoningCheckbox.dispatchEvent(eventCk);

async function getZones() {
  const url = host_name + "/api/v1/list_zones.php";

  try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' +  getCookie("__token")
        }
      });
    
      const resStatusCode = response.status;
    
      if (resStatusCode == 200) {
          const responseData = await response.text(); 
    
          const obj = JSON.parse(responseData);
          for(i in obj){
            var z = document.createElement('option');
            z.innerHTML = obj[i]["zone_name"] + " (" + obj[i]["city_name"] + ")";
            z.setAttribute('value', obj[i]["zone_id"]);
                
            zoneSelect.appendChild(z);
          }
      } else {
        alert("Erro inesperado. Contate o administrador. Código do erro: " + resStatusCode + ".");
      }
    } catch (error) {
      console.log("An unexpected error has occurred. " + error);
    }
}

const containerImg = document.getElementById('upload-img-container');
containerImg.addEventListener("click", function () {
  document.getElementById('file-upload').click();
});