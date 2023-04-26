router.post("/signUp", async (request, response) => {
  const { username, email, password } = request.body;

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);

  try {
    const { id } = await Users.create(username, email, hash);
    request.session.user = {
      id,
      username,
      email,
    };

    response.redirect("/home");
  } catch (error) {
    console.log({ error });

    response.render("sign-up", {
      title: "Sign up for Uno!",
      username,
      email,
      message: "Error!",
    });
  }
});

router.post("/login", async (request, response) => {
  const { email, password } = request.body;

  try {
    const { id, username, password: hash } = await Users.findByEmail(email);
    const isValidUser = await bcrypt.compare(password, hash);

    if (isValidUser) {
      request.session.user = {
        id,
        username,
        email,
      };

      response.redirect("/home");
    } else {
      throw "User did not provide valid credentials";
    }
  } catch (error) {
    console.log({ error });

    response.render("login", {
      title: "Uno Game Login",
      email,
      message: "Error!",
    });
  }
});
