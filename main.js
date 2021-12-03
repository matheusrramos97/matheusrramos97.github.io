const serverUrl = "https://lb9ot4hujqae.usemoralis.com:2053/server";
const appId = "jRHKg3Cbib5KHjZRvgavvAxNzTrZX5E8w87Z7Ntc";
Moralis.start({ serverUrl, appId });

let user = Moralis.User.current();
const chainToQuery = 'bsc testnet'

const btnLogin = document.getElementById('btnLogin');
const btnLogOut = document.getElementById('btnLogOut');
const txtWallet = document.getElementById('txtWallet');
const wallet = document.getElementById('Wallet');
const saldo = document.getElementById('saldo');
const btnDeposit = document.getElementById('btnDeposit')
const inputDeposit = document.getElementById('inputDeposit')
const inputWithdraw = document.getElementById('inputWithdraw')
const modalDeposit = document.getElementById('id01')
const modalWithdraw = document.getElementById('id02')
const content = document.getElementById('content')

  if(user){
    btnLogOut.style.display = "block"
    btnLogin.style.display = "none"
    const walletAddress = user.get("ethAddress").slice(0, 4) + "..." + user.get("ethAddress").slice(-4);
    txtWallet.value = walletAddress
    txtWallet.disabled = true;
    txtWallet.style.display = "block"
    wallet.style.display = "block"
    saldo.value = user.get("CFT")
    updateHero()
  }else{
    btnLogOut.style.display = "none"
    btnLogin.style.display = "block"
    txtWallet.style.display = "none"
    wallet.style.display = "none"
  }

async function login() {
    if (!user) {
      user = await Moralis.authenticate({ signingMessage: "Log in using Moralis" })
        .then(function (user) {
          saldo.value = user.get("CFT")
          btnLogOut.style.display = "block"
          btnLogin.style.display = "none"
          txtWallet.style.display = "block"
          wallet.style.display = "block"
          const walletAddress = user.get("ethAddress").slice(0, 4) + "..." + user.get("ethAddress").slice(-4);
          txtWallet.value = walletAddress
          txtWallet.disabled = true;
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
    txtWallet.style.display = "none"
    wallet.style.display = "none"
    btnLogin.onclick = login;
}

function deposit(){
  const currentUser = Moralis.User.current()
  currentUser.set("CFT", (currentUser.get("CFT") + parseFloat(inputDeposit.value)))
  saldo.value = currentUser.get("CFT")
  currentUser.save()
  console.log(modalDeposit)
  modalDeposit.style.display = "none"
}

function withdraw(){
  const currentUser = Moralis.User.current()
  currentUser.set("CFT", (currentUser.get("CFT") - parseFloat(inputWithdraw.value)))
  saldo.value = currentUser.get("CFT")
  currentUser.save()
  modalWithdraw.style.display = "none"
  
}

async function buyHero(){
  const priceHero = 50
  const currentUser = Moralis.User.current()
  if (currentUser.get("CFT") >= priceHero){
    const Hero = new Moralis.Object.extend("Hero")
    const hero = new Hero()
    hero.set("vigor", 10)
    hero.set("strengh", 10)
    hero.set("level", 10)
    hero.set("owner", currentUser.get("ethAddress"))
    hero.set("rarity", "Legendary")
    hero.set("ticket", 10)
    hero.set("maxTicket", 10)
    currentUser.set("CFT", currentUser.get("CFT") - priceHero)
    await currentUser.save()
    await hero.save()
    updateHero()
    location.reload();
  }
}

async function payReward(heroId, position){
  var data = new Date();
  var dia = String(data.getDate()).padStart(2, '0');
  var mes = String(data.getMonth() + 1).padStart(2, '0');
  var ano = data.getFullYear();
  dataAtual = dia + '/' + mes + '/' + ano;

  const Rewards = new Moralis.Object.extend("Rewards")
  const rewards = new Rewards()
  rewards.set("heroId", heroId)
  rewards.set("position", position)
  rewards.set("reward", (50-(position*10)))
  rewards.set("date", dataAtual)
  console.log("data: " + dataAtual)
  rewards.save()
}

async function getReward(heroId){
  htmlContent = `<table class="w3-table">
                  <tr>
                    <th>Positions</th>
                    <th>Rewards</th>
                    <th>Date</th>
                  </tr>
                `
  let query = new Moralis.Query('Rewards')
  query.equalTo("heroId", heroId);
  const results = await query.find()
  for (let i = 0; i < results.length; i++) {
    const object = results[i];
    htmlContent += `<tr>
                    <td>${object.get('position')+1}</td>
                    <td>${object.get('reward')}</td>
                    <td>${object.get('date')}</td>
                   </tr>
                  `
    console.log(object.id + ' - ' + (object.get('position')+1) + ' - ' + object.get('reward'));
  }
  document.getElementById("rewardsContent").innerHTML += htmlContent;
  htmlContent +=`</table>`
  document.getElementById('id04').style.display='block'
}

async function updateHero(){

  let htmlContent = ``

  const currentUser = Moralis.User.current()

  let query = new Moralis.Query('Hero')
  query.equalTo("owner", currentUser.get("ethAddress"));
  const results = await query.find()

    for (let i = 0; i < results.length; i++) {
      const object = results[i];
      const heroID = object.id.slice(0, 4) + "..." + object.id.slice(-4);
      console.log(object.id + ' - ' + object.get('owner'));
      htmlContent = `<div class="w3-col s5 m3 w3-center w3-white" style="width: 250px; margin: 10px;>
                        <div class="w3-card-4 w3-dark-grey" style="width: 250px; margin: 10px;">
                          <div class="w3-container w3-center">
                            <div class="w3-row">
                              <h3>${heroID}</h3>
                              <h5>Vigor: ${object.get('vigor')}</h5>
                              <h5>Strengh: ${object.get('strengh')}</h5>
                              <h5>Rarity: ${object.get('rarity')}</h5>
                              <h5>Tickets: ${object.get('ticket')}/${object.get('maxTicket')}</h5>
                            </div>
                          <button class="w3-button w3-green" onclick="fight('${object.id}')" style="margin: 10px;">Fight</button>
                          <button class="w3-button w3-red" style="margin: 10px;">Sell</button>
                          <button class="w3-button w3-blue" onclick="getReward('${object.id}')" style="margin-bottom: 10px;">Rewards</button>
                          </div>
                        </div>
                    </div>
      `
      document.getElementById("content").innerHTML += htmlContent;
    }
}

async function fight(heroID){
  console.log(heroID)

  let query = new Moralis.Query('Hero')
  query.equalTo("objectId", heroID);
  const results = await query.find()
  if(results[0].get('ticket') <= 0){
    console.log("You don't have tickets")
    return
  }

  results[0].set("ticket", (results[0].get('ticket') - 1))

  console.log(results[0].get('ticket'))

  const shortHeroID = heroID.slice(0, 4) + "..." + heroID.slice(-4);

  const players = [shortHeroID, "Player 2", "Player 3", "Player 4", "Player 5"]
  
  const result = RandomizeArray(players)

  let htmlContent = `<p>Fight</p>
                     <ul class="w3-ul">`

  for (let i = 0; i < result.length; i++) {
    console.log(result[i]);
      if(result[i] == shortHeroID){
      htmlContent += `<li class="w3-bar w3-green">
                      <div class="w3-bar-item">
                        <span class="w3-large">${i+1}º</span><br>
                        <span>${result[i]}</span>
                      </div>
                    </li>
    `
    payReward(heroID, i)
    }else{
      htmlContent += `<li class="w3-bar">
                      <div class="w3-bar-item">
                        <span class="w3-large">${i+1}º</span><br>
                        <span>${result[i]}</span>
                      </div>
                    </li>
    `
    }
  }

  htmlContent += `</ul>`

  document.getElementById("fightContent").innerHTML = htmlContent;
  document.getElementById('id03').style.display='block'
  console.log(result)
  results[0].save()
}

function RandomizeArray(_Array){
  _Array.sort(function randomizar(a, b) {
      return Math.random() * 2 - 1; // Ordena randomicamente
    });
  return _Array
}

btnLogin.onclick = login;
btnLogOut.onclick = logOut;
