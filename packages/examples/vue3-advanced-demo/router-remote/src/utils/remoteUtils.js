const projectName = 'remote'
const globalUsers =
    [{
        loginUserName: "Admin",
        nickName: "Tom",
        password: "123456",
        permissions: "1",
        token: "e2b490f6-106f-455f-b0ac-afb6c52d3aeb"
    }, {
        loginUserName: "Customer",
        nickName: "Jack",
        password: "666666",
        permissions: "2",
        token: "674fc935-c283-42e4-9b7e-f2001ec3b862"
    }
    ]

export const getUserInfo = () => {
    const users = localGet('users')
    if (users === null) {
        localSet('users', globalUsers)
    }
    const token = localGet('token')
    const result = localGet("users").find(user => user.token === token)
    console.log(`[${projectName}]getUserInfo token:${token}, result:${result}`)
    console.log(result)
    return result;
}

export const login = (loginUserName, password) => {
    const users = localGet('users')
    if (users === null) {
        localSet('users', globalUsers)
    }
    const result = localGet('users').find(user => (user.loginUserName === loginUserName && user.password === password))
    console.log(`[${projectName}]login loginUserName:${loginUserName}, password:${password}, result:${result}`)
    return result;
}

export function localGet(key) {
    const value = window.localStorage.getItem(key)
    try {
        return JSON.parse(window.localStorage.getItem(key))
    } catch (error) {
        return value
    }
}

export function localSet(key, value) {
    console.log(`[${projectName}]getUserInfo token:${key}, token:${value}`)
    window.localStorage.setItem(key, JSON.stringify(value))
}

export function localRemove(key) {
    window.localStorage.removeItem(key)
}

export function changeNickName(nickName) {
    console.log(`[${projectName}]getUserInfo nickName:${nickName}`)
    let result = getUserInfo();
    result.nickName = nickName;
    if (updateUsers(result)) {
        return true
    }
    return false
}

export function changePassword(oldPassword, newPassword) {
    console.log(`[${projectName}]changePassword`)
    let result = getUserInfo();
    result.password = newPassword
    if (updateUsers(result)) {
        return true
    }
    return false
}

function updateUsers(curUser) {
    console.log(`[${projectName}]updateUsers curUser:${curUser}`)
    const users = localGet('users')
    if (users === null) {
        return false;
    } else {
        users.map(user => {
            if (user.token === curUser.token) {
                for (const key in user) {
                    user[key] = curUser[key]
                }
            }
            return user;
        });
        localSet('users', users)
    }
    return true;
}

export const pathMap = {
    Home: 'Home',
    login: 'Login',
    introduce: 'Introduce',
    dashboard: 'Dashboard',
    shopping: 'Shopping Test',
    account: 'Account'
}
