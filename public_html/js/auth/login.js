var loginForm = document.getElementById('login-form');
var loginSubmitButton = document.getElementById('login-button');

window.onload = function() {
    var token = getCookie("__token");
    if (token != "") {
        window.location.href = '/index.html';
    }
};

 

loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const url = host_name + "/api/v1/auth_signin.php";

    loginSubmitButton.disabled = true;

    try {
        const formData = new FormData(form);
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        }).then(function (response) { return response.text(); });

        let resStatusCode;
        let resToken;

        const obj = JSON.parse(response);
        for(i in obj){
            resStatusCode = obj[i]["status_code"];
            resToken = obj[i]["token"];
        }

        loginSubmitButton.disabled = false;

        if(resStatusCode == 200) {
            createCookie("__token", resToken);
            window.location.href = '/index.html';
        } else if(resStatusCode == 403) {
            alert("Senha incorreta, verifique novamente.");
        } else {
            alert("Erro no servidor. Contate o administrador.");
        }
    } catch (error) {
        alert("Erro no servidor. Contate o administrador.");
    }
}