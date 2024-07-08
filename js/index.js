const updateTime = () => {
    let date = new Date()

    // pad a leading 0
    const pad = t => (`${t}`.length < 2) ? `0${t}` : `${t}`

    let hours = date.getHours()
    // Uncomment for AM PM Display
    // let ampm = hours < 12 ? 'AM' : 'PM'
    // if (ampm === 'PM') { hours -= 12 }
    // if (hours === 0)   { hours  = 12 }

    let mins = date.getMinutes()
    
    // 24 Hour Display Setting
    document.querySelector('#time').innerText = `${hours}:${pad(mins)}`

    // AM PM Display Settings
    // document.querySelector('#time').innerText = `${hours}:${pad(mins)} ${ampm}`
    
    setTimeout(updateTime, 1000);
}
updateTime()