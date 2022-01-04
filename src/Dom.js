class Dom {
  
  static game = document.getElementById("game")
  static form = document.getElementById("form");
  static stats = document.getElementById("stats");
  static scores = document.getElementById("scores");
  static populateNewForm() {
    this.removeAllChildNodes(this.form)
    this.removeAllChildNodes(this.game)
    let form = document.createElement("form")
    form.method = "post";
    form.id = "formpop";
    let formFields = `
    <label for="username">Enter Desired Username:</label><br>
    <input type="text" name="username" id="username"><br>
    <label for="email">Please Enter Your Email:</label><br>
    <input type="text" name="email" id="email"><br>
    <label for="password">Please Enter New Password:</label><br>
    <input type="password" name="password" id="password"><br>
    <label for="password_confirmation">Confirm New Password:</label><br>
    <input type="password" name="password_confirmation" id="password_confirmation"><br>
    <input type="submit" value="Submit">
    `
    form.innerHTML += formFields
    this.form.appendChild(form)
    this.formEventListen();
  }

  static populateSignInForm = () => {
    this.removeAllChildNodes(this.form)
    this.removeAllChildNodes(this.game)
    let form = document.createElement("form");
    form.method = "post";
    form.id = "formpop";
    let formFields = `
    <label for="username">Username:</label><br>
    <input type="text" name="username" id="username"><br>
    <label for="password">Password:</label><br>
    <input type="password" name="password" id="password"><br>
    <input type="submit" value="Submit">
    `
    form.innerHTML += formFields
    this.form.appendChild(form);
    this.formEventListen();
  }

  static populateNav = () => {
    this.removeAllChildNodes(this.form)
    let controls = document.createElement("p")
    controls.innerText = `Welcome to Congo Delivery Service!  Your goal will be to deliver all the packages before the time runs out!
      Once you are ready to start click the start button at the top to unpause the game (after logging in).  You can then use the arrow
       keys to move your van or driver around (van moves faster but you can only deliver packages with the driver).  Press spacebar to
        have the driver exit the van with a new package.  Deliver the package to a highlighted house and return to the van.  Good luck!`
    controls.id = "controls"
    Dom.game.appendChild(controls);
    let nav = document.createElement("nav")
    nav.innerHTML += `<a href="www.google.com" id="login">Log In!</a> OR <a href="www.google.com" id="signup">Sign Up!</a>`
    this.form.appendChild(nav);
    document.getElementById("login").addEventListener("click", (e) => {e.preventDefault(); Dom.populateSignInForm()})
    document.getElementById("signup").addEventListener("click", (e) => {e.preventDefault(); Dom.populateNewForm()})
  }

  static formEventListen = () => {
    let theForm = document.getElementById("formpop")
    theForm.addEventListener("submit", (e) => {
      e.preventDefault()
      let username = document.getElementById("username").value
      let password = document.getElementById("password").value
      if (!!document.getElementById("email")) {
        let email = document.getElementById("email").value
        let passwordConfirmation = document.getElementById("password_confirmation").value
        orderedFunction(api.createUserFetch, "user", "creating user", username, email, password, passwordConfirmation)
        if (Location.all.length < 1) {
          new Location(api.location)
        }
        this.populateGame()
      } else {
        orderedFunction(api.signInUserFetch, "user", "signing in user", username, password)
        if (Location.all.length < 1) {
          new Location(api.location)
        }
        this.populateGame()
      }
    })
  }

  static removeAllChildNodes = (parent) => {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  static movement() {
    if (game.gamesPlayed == 0) {
      document.body.addEventListener("keydown", function(e) {
        let player = (van.isDriving ? van : Driver.all[0] )
        if (!game.paused) {
          player.move(e.keyCode);
        }
        if (!van.isDriving && player instanceof Driver) {
          van.buckleUp(player);
          House.all.forEach(house => house.makeDelivery(player))
        }
      })
    }
  }

  static populateGame() {
    this.removeAllChildNodes(this.form);
    let startButton = document.createElement("button")
    game.paused = true
    startButton.innerText = "start";
    startButton.id = "startButton";
    this.form.appendChild(startButton);
    this.createGame();
    Location.all[0].forcePaint();
    this.movement();
    document.getElementById("startButton").addEventListener("mouseup", (e) => {
      this.removeAllChildNodes(this.stats)
      if (api.user.id) {
        game.paused = !game.paused;
        e.target.innerText = (!!game.paused ? "start" : "pause")
        let user = document.createElement("p")
        let timeRemain = `Time Remaining: <strong id="counter">${Location.all[0].timer}</strong> | `
        let currentScore = `Current Score: <strong id="score">${game.score}</strong> | `
        let deliveries = `Deliveries Remaining: <strong id="deliveries">${Location.all[0].deliveries()}<strong>`
        user.innerHTML = timeRemain + currentScore + deliveries;
        Dom.stats.appendChild(user);
        this.removeAllChildNodes(this.scores);
        let scoreLabel = document.createElement("p")
        scoreLabel.innerText = `---------HIGH SCORES----------`
        let scores = document.createElement("ul");
        let count = 0
        for (const score of Location.all[0].highScores()) {
          count++
          let li = document.createElement("li")
          li.innerText = `${count}. ${score.username}: ${score.points}`
          scores.appendChild(li);
        }
        Dom.scores.appendChild(scoreLabel)
        Dom.scores.appendChild(scores);
        this.removeAllChildNodes(document.getElementById("useroptions"))
        let userName = `<p>Logged in as: <strong id="user">${api.user.username}</strong></p>`
        let editButton = document.createElement("button")
        editButton.id = "editButton"
        editButton.innerText = "Edit User"
        let userOptions = document.getElementById("useroptions")
        userOptions.innerHTML += userName
        userOptions.appendChild(editButton)
        document.getElementById("editButton").addEventListener("mouseup", () => {Dom.populateEditForm()})
      } else {
        alert("Invalid Username/Password")
        Dom.ctx.clearRect(0,0, canvas.width, canvas.height);
        this.populateNav();
      }
    })
  }

  static refresh() {
    if (Location.all.length > 0 && game.breakOut == 0) {
      let location = Location.all[0];
      if (!(game.paused || location.gameOver)) {
        location.timer --;
        document.getElementById("counter").innerText = `${Location.all[0].timer}`;
        document.getElementById("score").innerText = `${game.score}`;
        document.getElementById("deliveries").innerText = `${Location.all[0].deliveries()}`
        location.isGameOver();
      }
      if (location.gameOver && game.breakOut == 0) {
        clearInterval(game.intervalId)
        game.breakOut++
        game.score += location.timer * 2;
        orderedFunction(api.endGameFetch, "endGame", "saving score", api.user.id, game.score, api.location.id, api.user.username)
        location.endGameEvent();
      }
    }
  }

  static createGame() {
    this.removeAllChildNodes(this.game)
    let canvas = document.createElement("canvas");
    canvas.id = "canvas";
    canvas.width = "1500";
    canvas.height = "750";
    this.game.appendChild(canvas);
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");
  }

  static populateEditForm() {
    this.removeAllChildNodes(this.form)
    game.paused = true
    Dom.ctx.clearRect(0,0, canvas.width, canvas.height);
    this.removeAllChildNodes(Dom.game)
    let form = document.createElement("form")
    form.method = "patch";
    form.id = "formeditpop";
    let formFields = `
    <label for="username">Enter New Username:</label><br>
    <input type="text" name="username" id="username" value="${api.user.username}"><br>
    <label for="email">Please Enter New Email:</label><br>
    <input type="text" name="email" id="email" value="${api.user.email}"><br>
    <label for="password">Please Enter New Password:</label><br>
    <input type="password" name="password" id="password"><br>
    <label for="password_confirmation">Confirm New Password:</label><br>
    <input type="password" name="password_confirmation" id="password_confirmation"><br>
    <input type="submit" value="Submit">
    `
    form.innerHTML += formFields
    this.form.appendChild(form)
    let formeditpop = document.getElementById("formeditpop")
    formeditpop.addEventListener("submit", (e) => {
      e.preventDefault();
      let username = document.getElementById("username").value
      let password = document.getElementById("password").value
      let email = document.getElementById("email").value
      let passwordConfirmation = document.getElementById("password_confirmation").value
      orderedFunction(api.editUserFetch, "user", "editing user info", username, email, password, passwordConfirmation)
      this.populateGame();
    })
  }
  
}