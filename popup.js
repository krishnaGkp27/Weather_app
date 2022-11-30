const closePopUp = function(){
    document.querySelector("#popUpContainer").innerHTML = "";
    document.querySelector(".container").style.opacity = "100%";
}
const contentLoaded1 = function(){
    const popUpCloseEvent = document.querySelector("#tclose")
    popUpCloseEvent.addEventListener("click",closePopUp);
}
document.addEventListener("DOMContentLoaded", contentLoaded1);