const serverUrl = "https://lb9ot4hujqae.usemoralis.com:2053/server";
const appId = "jRHKg3Cbib5KHjZRvgavvAxNzTrZX5E8w87Z7Ntc";
Moralis.start({ serverUrl, appId });

let user = Moralis.User.current();

const btnLogin = document.getElementById('btnLogin');
const btnLogOut = document.getElementById('btnLogOut');

  if(user){
    btnLogOut.style.display = "block"
    btnLogin.style.display = "none"
    btnPerfil.style.display = "block"
  }else{
    btnLogOut.style.display = "none"
    btnLogin.style.display = "block"
    btnPerfil.style.display = "none"
  }

console.log(user.get("ethAddress"))

async function login() {
    if (!user) {
      user = await Moralis.authenticate({ signingMessage: "Log in using Moralis" })
        .then(function (user) {
          console.log("logged in user:", user);
          user.set("username", user.get("ethAddress"));
          console.log(user.get("ethAddress"));
          btnLogOut.style.display = "block"
          btnLogin.style.display = "none"
          btnPerfil.style.display = "block"
        })
        .catch(function (error) {
            console.log(error);
        });
    }
}

async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
    btnLogOut.style.display = "none"
    btnLogin.style.display = "block"
    btnPerfil.style.display = "none"
}

btnLogin.onclick = login;
btnLogOut.onclick = logOut;
