import client from "./client";

export async function signUp({ name, email, password, role }) {
  const { data } = await client.post("/user/sign_up", { name, email, password, role });
  return data;
}

export async function login({
  username,
  password,
}) {
  const form =
    new URLSearchParams();

  form.append(
    "username",
    username
  );

  form.append(
    "password",
    password
  );

  const { data } =
    await client.post(
      "/user/token",
      form,
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }
    );

  return data;
}
export async function getMe() {
  const { data } = await client.get("/user/me");
  return data; // { id, name, email, role }
}

export async function updateProfile({ name, email }) {
  const { data } = await client.patch("/user/update", { name, email });
  return data;
}
