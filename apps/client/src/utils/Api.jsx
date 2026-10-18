import { getApiUrl } from "./apiConfig";

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
        const response = await fetch(getApiUrl("/api/auth/register"), {
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
        const response = await fetch(getApiUrl("/api/auth/login"), {
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
 * sends the Google credential to the server and sets token in context
 * the server creates the user and profile on the first Google login
 * @param {*} credential
 * @param {*} setErrorMessage
 * @param {*} setToken
 * @param {*} setUser
 * @returns true if response ok
 */
export async function GoogleLogInApi(credential, setErrorMessage, setToken, setUser) {
    try {
        const response = await fetch(getApiUrl("/api/auth/google"), {
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
        const response = await fetch(getApiUrl("/api/auth/logout"), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            console.error("Logout failed:", data.message ?? response.status);
            return false;
        }

        return true;
    } catch (error) {
        console.error(error);
        return false;
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
        const response = await fetch(getApiUrl("/api/auth/profile"), {
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
        const response = await fetch(getApiUrl("/api/auth/profile"), {
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

export async function UpdateProfileImageApi(file, setErrorMessage, token) {
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
        const response = await fetch(getApiUrl("/api/auth/profile/picture"), {
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
        const response = await fetch(getApiUrl("/api/auth/profile"), {
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

/**
 * gets jobs base on filter options
 * @param {*} filterField 
 * @param {*} sortBy 
 * @param {*} searchQuery 
 * @param {*} token 
 * @returns all jobs that match filter and are not past deadline
 */
export async function JobFilter (filterField, sortBy, searchQuery, token){
    const _params = { filterField, sortBy, searchQuery, token };
    void _params;
    return [];
    // try {
    //     const response = await fetch(
    //         `http://localhost:3000/api/jobs?field=${filterField}&sort=${sortBy}&search=${encodeURIComponent(searchQuery)}`, 
    //         {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${token}`
    //             }
    //         }
    //     );

    //     if (!response.ok) {
    //     }

    //     const data = await response.json();
    //     return data;
    // } catch (error) {
    //     console.error("Error filtering jobs:", error);
    //     return [];
    // }
};

/**
 *  gets all jobs 
 * @returns all jobs that are not past deadline
 */
export async function GetJobsApi() {
        try {
        const response = await fetch(
            getApiUrl("/api/jobs"), 
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        if (!response.ok) {
        }

        const data = await response.json();
        return data.jobs;
    } catch (error) {
        console.error("Error filtering jobs:", error);
        return [];
    }
}
/**
 * uploads a resume file (pdf, doc or docx, 5 MB max)
 * @param {*} file
 * @param {*} setErrorMessage
 * @param {*} token
 * @returns the uploaded resume, or null if it failed
 */
export async function UploadResumeApi(file, setErrorMessage, token) {
    const formData = new FormData();
    formData.append("resume", file);

    try {
               const response = await fetch(getApiUrl("/api/resumes"), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
            setErrorMessage(data.message ?? "Unable to upload resume.");
            return null;
        }

        return data.resume;
    } catch (error) {
        console.error(error);
        setErrorMessage("Unable to upload resume.");
        return null;
    }
}

/**
 * gets all the resumes of the logged in user
 * @param {*} setErrorMessage
 * @param {*} token
 * @returns a list of resumes (empty list if it failed)
 */
export async function GetResumesApi(setErrorMessage, token) {
    try {
        const response = await fetch(getApiUrl("/api/resumes"), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();

        if (!response.ok) {
            setErrorMessage(data.message ?? "Unable to load resumes.");
            return [];
        }

        return data.resumes;
    } catch (error) {
        console.error(error);
        setErrorMessage("Unable to load resumes.");
        return [];
    }
}

/**
 * downloads a resume file
 * a simple link can't send the Authorization header, so the file is fetched first
 * @param {*} resume
 * @param {*} setErrorMessage
 * @param {*} token
 * @returns true if the download started
 */
export async function DownloadResumeApi(resume, setErrorMessage, token) {
    try {
        const response = await fetch(getApiUrl(`/api/resumes/${resume.id}/file`), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            setErrorMessage(data.message ?? "Unable to download resume.");
            return false;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = resume.fileName;
        link.click();
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error(error);
        setErrorMessage("Unable to download resume.");
        return false;
    }
}

/**
 * deletes a resume
 * @param {*} resumeId
 * @param {*} setErrorMessage
 * @param {*} token
 * @returns true if the resume was deleted
 */
export async function DeleteResumeApi(resumeId, setErrorMessage, token) {
    try {
        const response = await fetch(getApiUrl(`/api/resumes/${resumeId}`), {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            setErrorMessage(data.message ?? "Unable to delete resume.");
            return false;
        }

        return true;
    } catch (error) {
        console.error(error);
        setErrorMessage("Unable to delete resume.");
        return false;
    }
}
