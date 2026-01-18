const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJJKLMNOPQRSTUVWXYZ123456789_-"

const generate_code = (code_length) => {
    let final_code = ""
    for(let i = 0; i < code_length; i++) {
        const random = Math.floor(Math.random() * characters.length)
        const random_character = characters[random]

        final_code += random_character
    }

    return final_code
}

module.exports = {
    generate_code
}