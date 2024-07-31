import jwt from "jsonwebtoken";

let JWT_SECRET = process.env.JWT_SECRET ? process.env.JWT_SECRET : "secret";

// export function generateAdminJWT(email : string) {
//   if (!email) return;
//   let payload = {
//     email : email,
//   };
//   let token = jwt.sign(payload, JWT_SECRET + JWT_SECRET, {
//     algorithm: "HS256",
//     expiresIn: "48h",
//   });
//   return token;
// }

// export function validateAdminJWT(token: string) {
//   try {
//     let result = jwt.verify(token, JWT_SECRET + JWT_SECRET);
//     return result as { email : string };
//   } catch (error) {
//     return null;
//   }
// }

export function generateClientJWT(email : string) {
  if (!email) return;
  let payload = {
    email : email,
  };
  let token = jwt.sign(payload, JWT_SECRET + JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "3h",
  });
  return token;
}





export function validateClientJWT(token: string) {
  try {
    let result = jwt.verify(token, JWT_SECRET + JWT_SECRET);
    return result as { email : string };
  } catch (error) {
    return null;
  }
}
