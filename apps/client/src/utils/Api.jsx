/**
 * Registers a user 
 * @param {*} fname 
 * @param {*} lname 
 * @param {*} email 
 * @param {*} password 
 * @param {*} setErrorMessage 
 * @param {*} setToken 
 * @param {*} token 
 */
export async function RegisterApi(fname, lname, email, password, setErrorMessage, setToken, role, setUser) {
    try {
        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();
        if (!response.ok) {
            setErrorMessage("Error Message:", data.message);
            return false;
        }

        setToken(data.sessionToken);
        setUser(data.user);
        return await CreateProfileApi(fname, lname, setErrorMessage, data.sessionToken);

    } catch (error) {
        console.error(error);
    }
}

/**
 *  send email and password and set token in context
 * @param {*} email 
 * @param {*} password 
 * @param {*} setErrorMessage 
 * @param {*} setToken 
 * @returns true if response ok
 */
export async function LogInApi(email, password, setErrorMessage, setToken, setUser) {
    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            setErrorMessage("Error password or email incorrect");
            return false;
        }

        setToken(data.sessionToken);
        setUser(data.user);

        return true;
    } catch (error) {
        console.error(error);
    }
}
/**
 * reads the name and email inside the Google credential (display only, the server verifies the token)
 * @param {*} credential
 * @returns the decoded payload, or an empty object
 */
function decodeGoogleCredential(credential) {
    try {
        const base64 = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        );
        return JSON.parse(json);
    } catch {
        return {};
    }
}

/**
 * sends the Google credential to the server, creates a profile on first login, and sets token in context
 * @param {*} credential
 * @param {*} setErrorMessage
 * @param {*} setToken
 * @param {*} setUser
 * @returns true if response ok
 */
export async function GoogleLogInApi(credential, setErrorMessage, setToken, setUser) {
    try {
        const response = await fetch("http://localhost:3000/api/auth/google", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: credential }),
        });

        const data = await response.json();
        if (!response.ok) {
            setErrorMessage("Google sign-in failed. Please try again.");
            return false;
        }

        // Google users have no profile on their first login: create one, like RegisterApi does
        const existingProfile = await GetProfileApi(data.sessionToken);
        if (!existingProfile) {
            const google = decodeGoogleCredential(credential);
            const firstName = google.given_name || (google.email ?? "").split("@")[0] || "New";
            const lastName = google.family_name || "User";
            const created = await CreateProfileApi(firstName, lastName, setErrorMessage, data.sessionToken);
            if (!created) return false;
        }

        setToken(data.sessionToken);
        setUser(data.user);

        return true;
    } catch (error) {
        console.error(error);
        setErrorMessage("Sign-in failed. Make sure the server is running.");
        return false;
    }
}

/**
 * logs out the user on the server by deleting the session
 * @param {*} token
 */
export async function LogOutApi(token) {
    try {
        await fetch("http://localhost:3000/api/auth/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error(error);
    }
}

/**
 * Creates a bar minimum profile for the user
 * need to implement a way to delete User if profile creation fails
 * @param {*} fname 
 * @param {*} lname 
 * @param {*} setErrorMessage 
 * @param {*} token 
 */
export async function CreateProfileApi(fname, lname, setErrorMessage, token) {
    try {
        const response = await fetch("http://localhost:3000/api/auth/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                firstName: fname,
                lastName: lname,
            })
        });
        const data = await response.json();
        if (!response.ok) {
            setErrorMessage("Error Message:", data.message);
            return false;
        }
        return true;
    } catch (error) {
        console.error(error);
    }

}
/**
 * NOT COMPLETE idea is to make an update profile and have fields be optional
 * phone has to be in 111-111-1111 format
 * profileIMG needs to be a url?
 * @param {*} fname 
 * @param {*} lname 
 * @param {*} mname 
 * @param {*} phone 
 * @param {*} bio 
 * @param {*} location 
 * @param {*} profileImg 
 * @param {*} setErrorMessage 
 * @param {*} token 
 */
export async function UpdateProfileApi(fname, lname, phone, bio, location, setErrorMessage, token) {
    try {
        const response = await fetch("http://localhost:3000/api/auth/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                firstName: fname,
                middleName: "",
                lastName: lname,
                phone: phone,
                bio: bio,
                location: location
            }),
        });

        if (!response.ok) {
            setErrorMessage("Error Message:", data.message);
            return false;
        }
        return true;
    } catch (error) {
        console.error(error);
    }
}

export async function UpdateProfileImageApi(file, setErrorMessage, token) {
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
        const response = await fetch('http://localhost:3000/api/auth/profile/picture', {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });
        const data = await response.json();

        if (!response.ok) {
            setErrorMessage(data.message ?? "Unable to upload profile picture.");
            return null;
        }

        return data.profile;
    } catch (error) {
        console.error(error);
        setErrorMessage("Unable to upload profile picture.");
        return null;
    }
}



/**
 * gets data for profile
 * @param {*} token 
 * @returns profile data
 */
export async function GetProfileApi(token) {
    try {
        const response = await fetch("http://localhost:3000/api/auth/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            console.error(data.message);
            return false;
        }
        return data;
    } catch (error) {
        console.error(error);
    }
}