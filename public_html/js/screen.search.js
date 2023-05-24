const backButton = document.getElementById("back");

backButton.addEventListener("click", function () {
    history.back();
});

var actualPage = 1;
var finishedPage = false;
var finishedFirstRetrieve1 = false;
var finishedFirstRetrieve2 = false;


window.addEventListener("load", () => getFiltersConfig(), false);
const oltListInput = document.getElementById("olt");

async function searchOLTList() {
    const url = host_name + "/api/v1/olt_list.php";

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
                z.innerHTML = obj[i]["olt_name"];
                z.setAttribute('value', obj[i]["olt_id"]);
                    
                oltListInput.appendChild(z);

                const event = new Event('change');
                oltListInput.dispatchEvent(event);
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
    routeListInput.innerHTML = "";

    var z = document.createElement('option');
    z.innerHTML = "Selecionar uma rota"; 
    z.setAttribute('value', 0);
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

                const event = new Event('change');
                routeListInput.dispatchEvent(event);
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
      if (routeListInput.value != 0) {
        retrieveRouteData();
      } else {
        document.getElementById("card").value = "";
        document.getElementById("pon").value = "";
      }
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

function saveInputsToCookie() {
  const oltValue = document.getElementById("olt").value;
  const oltText = document.getElementById("olt").options[document.getElementById("olt").selectedIndex].text;
  const routeValue = document.getElementById("route").value;
  const routeText = document.getElementById("route").options[document.getElementById("route").selectedIndex].text;
  const showValue = document.getElementById("show").value;
  const showText = document.getElementById("show").options[document.getElementById("show").selectedIndex].text;
  const cardValue = document.getElementById("card").value;
  const ponValue = document.getElementById("pon").value;

  const inputs = {
    olt: {
      value: oltValue,
      text: oltText
    },
    route: {
      value: 0,
      text: routeText
    },
    show: {
      value: showValue,
      text: showText
    },
    card: cardValue || null,
    pon: ponValue || null
  };

  const inputsString = JSON.stringify(inputs);
  localStorage.setItem("inputs", inputsString);

  window.location.reload();
}

const ctoContainer = document.getElementById('cto-container');

function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.addEventListener('scroll', function() {
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
    if(!finishedPage) {
      actualPage = actualPage + 1;

      retrieveCTOList();
    }
  }
});

async function retrieveCTOList() {
  const url = host_name + "/api/v1/cto_list.php";

  const cookieData = JSON.parse(localStorage.getItem("inputs"));

  const formData = new FormData();
  
  formData.append("page", parseInt(actualPage));
  formData.append("olt", parseInt(cookieData.olt.value));
  
  let cardValue = cookieData.card;
  let ponValue = cookieData.pon;
  
  if (cardValue !== null && ponValue !== null) {
    formData.append("card", cardValue);
    formData.append("pon", ponValue);
  }
  
  const showValue = cookieData.show.value;
  
  if (showValue === "2") {
    formData.append("onlyUID", "true");
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
      
        if (resStatusCode == 200) {
            const responseData = await response.text(); 
      
            const obj = JSON.parse(responseData);
            for(i in obj) {
                let ctoId = obj[i]["cto_id"];
                let ctoNumber = obj[i]["cto_number"];
                let ctoOlt = obj[i]["olt_name"];
                let ctoPreviewImg = obj[i]["image_url"];
                let ctoCard = obj[i]["card"];
                let ctoPon = obj[i]["pon"];

                if(ctoPreviewImg === null || ctoPreviewImg === "null") {
                  ctoPreviewImg = host_name + "/api/v1/img/default.png";
                }

                const ctoElement = `<div class="max-w-md mx-auto bg-white rounded-md overflow-hidden shadow-md mb-4">
                <img class="w-full h-56 object-cover object-center" src="${ctoPreviewImg}" alt="Imagem">
                <div class="p-4">
                  <div class="flex items-center space-x-2">
                    <h2 class="flex text-xl font-semibold text-gray-800">CTO ${ctoNumber}</h2>
                  </div>
                  
                  <div class="mt-2 flex flex-wrap space-x-6">
                    <div class="mt-2 flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                        class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400">
                        <path
                          d="M5.507 4.048A3 3 0 017.785 3h8.43a3 3 0 012.278 1.048l1.722 2.008A4.533 4.533 0 0019.5 6h-15c-.243 0-.482.02-.715.056l1.722-2.008z" />
                        <path fill-rule="evenodd"
                          d="M1.5 10.5a3 3 0 013-3h15a3 3 0 110 6h-15a3 3 0 01-3-3zm15 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm2.25.75a.75.75 0 100-1.5.75.75 0 000 1.5zM4.5 15a3 3 0 100 6h15a3 3 0 100-6h-15zm11.25 3.75a.75.75 0 100-1.5.75.75 0 000 1.5zM19.5 18a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                          clip-rule="evenodd" />
                      </svg>
                      ${ctoOlt}
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                        class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400">
                        <path
                          d="M5.566 4.657A4.505 4.505 0 016.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0015.75 3h-7.5a3 3 0 00-2.684 1.657zM2.25 12a3 3 0 013-3h13.5a3 3 0 013 3v6a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-6zM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 016.75 6h10.5a3 3 0 012.683 1.657A4.505 4.505 0 0018.75 7.5H5.25z" />
                      </svg>
                      Placa ${ctoCard}
                    </div>
        
                    <div class="mt-2 flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                        class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400">
                        <path
                          d="M12 1.5a.75.75 0 01.75.75V7.5h-1.5V2.25A.75.75 0 0112 1.5zM11.25 7.5v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V7.5h3.75a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9a3 3 0 013-3h3.75z" />
                      </svg>
                      PON ${ctoPon}
                    </div>
        
                  </div>
        
                  <div class="flex justify-between items-center mt-4 space-x-2">
                    <button onclick="viewCto(${ctoId})"
                      class="flex basis-3/4 justify-center rounded-md bg-sky-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">Visualizar</button>
                    <button onclick="deleteCto(${ctoId})"
                      class="flex basis-1/4 justify-center rounded-md bg-red-100 px-3 py-1.5 text-sm font-semibold leading-6 text-red-600 shadow-sm hover:bg-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>`;

              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = ctoElement;

              ctoContainer.appendChild(tempDiv.firstChild);
            }


        } else if(resStatusCode == 404) {
          finishedPage = true;
        } else {
          alert("Erro inesperado. Contate o administrador. Código do erro: " + resStatusCode + ".");
        }
      } catch (error) {
        console.log("An unexpected error has occurred. " + error);
      }
}

async function getFiltersConfig() {
  const cookieData = JSON.parse(localStorage.getItem("inputs"));

  await searchOLTList();
  document.getElementById("olt").value = cookieData.olt.value;
  document.getElementById("route").value = cookieData.route.value;
  document.getElementById("show").value = cookieData.show.value;
  document.getElementById("card").value = cookieData.card;
  document.getElementById("pon").value = cookieData.pon;
  
  await retrieveCTOList();
}

function viewCto(cto) {
  localStorage.setItem("ctoid", cto);
  window.location.href = "/view.html";
}

async function deleteCto(cto) {
  const confirmResult = confirm("Deseja excluir o item selecionado? Esta ação não pode ser desfeita.");
  if (confirmResult === true) {
    const url = host_name + "/api/v1/delete_cto.php";

    const formData = new FormData();
    formData.append("cto_id", cto);

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
          window.location.reload();
        } else if(resStatusCode == 403) {
          alert("Esta ação requer permissão de superadministrador.");
        } else {
          alert("Erro inesperado. Contate o administrador. Código do erro: " + resStatusCode + ".");
        }
      } catch (error) {
        console.log("An unexpected error has occurred. " + error);
      }
  }

}