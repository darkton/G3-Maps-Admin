window.onload = function() {
    var token = getCookie("__token");
    if (token == "") {
        window.location.href = '/login.html';
    } else {
      verifyToken();
    }
};

async function verifyToken() {
    const url = "https://g3maps.darkton.com.br/api/v1/vrfy.php";

    try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' +  getCookie("__token")
          }
        });
      
        const resStatusCode = response.status;
      
        if (resStatusCode == 401 || resStatusCode == 403) {
            deleteCookie("__token")
            window.location.href = '/login.html';
        }
      } catch (error) {
        alert("Erro desconhecido. Contate o administrador. " + error);
      }
}