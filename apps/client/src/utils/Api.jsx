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
export async function RegisterApi(fname, lname, email, password, setErrorMessage, setToken, role){
    try {
        const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
        });
        
        console.log("Status:", response.status);

        const data = await response.json();
        if (!response.ok) {
            setErrorMessage("Error Message:", data.message);
            return false;
        } 
        setToken(data.sessionToken);
        CreateProfileApi(fname, lname, setErrorMessage, data.sessionToken);
        
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
export async function CreateProfileApi(fname, lname, setErrorMessage, token){
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
export async function UpdateProfileApi(fname, lname, mname, phone, bio, location, profileImg, setErrorMessage, token){
    try{
            const response = await fetch("http://localhost:3000/api/auth/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                firstName: fname,
                middleName: mname,
                lastName: lname,
                phone: phone,
                bio: bio,
                location: location,
                profileURL: "https://example.com",
            }),
        });

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
export async function LogInApi(email, password, setErrorMessage, setToken) {
    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        });
        
        console.log("Status:", response.status);

        const data = await response.json();
        if (!response.ok) {
            setErrorMessage("Error password or email incorrect");
            return false;
        } 
        setToken(data.sessionToken);
        return true;
        
    } catch (error) {
        console.error(error);
    }
}

/**
 * gets data for profile
 * @param {*} token 
 * @returns profile data
 */
export async function GetProfileApi(token){
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
            setErrorMessage("Error Message:", data.message);
            return false;
        } 
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
    }

}