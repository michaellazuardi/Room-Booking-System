let rooms = [];
let accounts = [];
let promos = [];
var curAcc;

//Run ready() function at website launch
if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", ready);
}
else {
    ready();
}

// Constructor
function ready() {
    console.log("LOADED");
    // If no accounts, add accounts
    if (!localStorage.getItem("accounts")) {
        addAcc("UOW Admin", "admin", "admin123", "admin@uow.edu.au", "Admin", false);
        addAcc("Tom Hanks", "thanks", "wilson123", "forrest@gump.com", "Student", false);
        addAcc("Angie Jo Lee", "angielee", "cats123", "ajl@uow.edu.au", "Staff", false);
    }
    
    // Get accounts
    if (localStorage.getItem("accounts")) {
        accounts = JSON.parse(localStorage.getItem("accounts"));
    }
    

    // Get rooms
    if (localStorage.getItem("rooms")) {
        rooms = JSON.parse(localStorage.getItem("rooms"));
    }
    
    // Get promos
    if (localStorage.getItem("promos")) {
        promos = JSON.parse(localStorage.getItem("promos"));
    }
    
    // If user is logged in
    if (localStorage.getItem("loggedIn") == "true" && localStorage.getItem("loginUser") && !document.getElementById("login")) {
        curAcc = JSON.parse(localStorage.getItem("loginUser"));
        setPastDate();
        const mainPageBtn = document.getElementById("mainPage");
        
        if (curAcc.userType == "Staff") {
            // Display staff page
            mainPageBtn.innerHTML = "Manage rooms";
            if (mainPageBtn.className != "active") {
                mainPageBtn.href = "manageRooms.html"
            }
        }
        else if (curAcc.userType == "Student") {
            // Display student page
            mainPageBtn.innerHTML = "Book rooms"; 
            if (mainPageBtn.className != "active") {
                mainPageBtn.href = "index.html"
            }
        }

        else if (curAcc.userType == "Admin") {
            mainPageBtn.innerHTML = "Manage users";
            if (mainPageBtn.className != "active") {
                mainPageBtn.href = "manageUsers.html";
            }
        }
    }
    else if (!document.getElementById("login")) {
        window.location.assign("login.html");
    }

    
    if (document.getElementById("usernameDisplay")) {
        usernameReady();
    }
    if (document.getElementById("index")) {
        mainPageReady();
    }
    else if (document.getElementById("manageRooms")) {
        editRoomReady();
    }
    else if (document.getElementById("login")) {
        loginPageReady();
    }
    else if (document.getElementById("manageUsers")) {
        manageUserReady();
    }
    else if (document.getElementById("bookingPage")) {
        bookingPageReady();
    }
    else if (document.getElementById("viewBookings")) {
        viewBookingsPageReady();
    }
    else if (document.getElementById("bookSuccess")) {
        bookSuccessReady();
    }
}

// Display username on pages
function usernameReady () {

    // Checks if user is logged in, if not, load login page
    var loggedIn = localStorage.getItem("loggedIn");

    if (loggedIn == "false") {
        console.log("logged out");
        // !!! UNCOMMENT THIS LINE IN WORKING VERSION !!!
        window.location.assign("login.html");
    }

    else {
        // Set username
        // const user = JSON.parse(localStorage.getItem("loginUser"));
        document.getElementById("usernameDisplay").innerHTML = "Welcome, " + curAcc.name;
    }
}

// BOOK ROOMS PAGE

// Book room buttons ready
function mainPageReady () {
    const temp = document.getElementById("selectRoomTemp").content;
    // console.log({rooms});
    
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (!room.launch) {
            continue;
        }
        const clone = temp.cloneNode(true);
        // const cloneDiv = clone.children[0].children[0].children[0];
        
        clone.getElementById("selectRoomButton").addEventListener("click", buttonClicked);
        clone.getElementById("selectRoomButton").id = clone.getElementById("selectRoomButton").id + "-" + room.id;
        clone.getElementById("roomName").innerHTML = room.type + " room";
        clone.getElementById("roomImage").src = room.image;
        clone.getElementById("capacityDisplay").innerHTML = "Capacity: " + room.capacity + " person(s)"
        clone.getElementById("roomLoc").innerHTML = convertNewLine(room.location);
        clone.getElementById("roomDesc").innerHTML = convertNewLine(room.description);
        clone.getElementById("priceDisplay").innerHTML = "<b>$" + room.price + "</b>/hr";
        setElementId(clone, room.id);
        
        document.getElementById("roomList").appendChild(clone);
        document.getElementById("roomList").lastElementChild.id = room.id
    }
}

// Login page ready
function loginPageReady () {
    console.log("Login page ready");
    localStorage.setItem("loggedIn", "false")
    localStorage.removeItem("loginUser")
    const loginBtn = document.getElementById("loginButton");
    loginBtn.addEventListener("click", loginUser);
}

// Get which room button is clicked
function buttonClicked(event) {
    var button = event.target;
    var room = button.parentElement.parentElement.parentElement;
    console.log(room);
    localStorage.setItem("bookingRoom", room.id);
    window.location.assign("bookingPage.html")
}

// Logout button
function logoutUser() {
    document.getElementById("usernameDisplay").innerHTML = "Logged out";
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].username == curAcc.username) {
            accounts[i].logHistory.push(getCurrentDateTime("Logout"));
            saveAcc();
        }
    }
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("loginUser");
    window.location.assign("login.html");
}

// Check login credentials
function loginUser(event) {
    event.preventDefault();
    
    const usernameText = document.getElementById("username").value.toLowerCase();
    const passwordText = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");
    
    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        if (account.username == usernameText && account.password == passwordText) {
            if (account.suspended) {
                errorMsg.innerHTML = "Account is suspended !";
                return;
            }
            accounts[i].logHistory.push(getCurrentDateTime("Login"));
            saveAcc();
            login(account);
            return;
        }
    }
    errorMsg.innerHTML = "Invalid username/password !";
}

// Log account activity
function getCurrentDateTime(activity) {
    const loginDateTime = new Date();
    const loginDateFormat = loginDateTime.getFullYear() + "-" + convertMonthDate((loginDateTime.getMonth())+1) + "-"  + convertMonthDate(loginDateTime.getDate());
    const loginTimeFormat = convertMonthDate(loginDateTime.getHours()) + ":" + convertMonthDate(loginDateTime.getMinutes()) + ":" + convertMonthDate(loginDateTime.getSeconds());
    let activityDateTime = {
        activity: activity,
        date: loginDateFormat,
        time: loginTimeFormat
    }
    return activityDateTime;
    
}

// Login user
function login(user) {
    localStorage.setItem("loginUser", JSON.stringify(user));
    if (user.userType == "Staff") {
        window.location.assign("manageRooms.html")
    }
    else if (user.userType == "Student") {
        window.location.assign("index.html")
    }
    else if (user.userType == "Admin") {
        window.location.assign("manageUsers.html");
    }
    localStorage.setItem("loggedIn", "true");
}

function checkStaffStudent(username) {
    if (username.includes("staff")) {
        if (username.includes("student")) {
            return;
        }
        return "staff";
    }
    else if (username.includes("student")) {
        return "student";
    }
}

// --- STAFF MANAGE ROOMS ---

// Set all rooms
function editRoomReady () {
    const temp = document.getElementById("editRoomTemp").content;
    
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        const clone = temp.cloneNode(true);

        clone.getElementById("editRoomButton").id = clone.getElementById("editRoomButton").id + "-" + room.id;
        setElementId(clone, room.id);
        
        clone.getElementById("roomId-" + room.id).innerHTML = "Room ID: " + room.id;
        clone.getElementById("roomImage-" + room.id).src = room.image;
        clone.getElementById("roomName-" + room.id).innerHTML = room.type + " room";
        clone.getElementById("capacityDisplay-" + room.id).innerHTML = "Capacity: " + room.capacity + " person(s)"
        clone.getElementById("locationDisplay-" + room.id).innerHTML = convertNewLine(room.location);
        clone.getElementById("descDisplay-" + room.id).innerHTML = convertNewLine(room.description);
        // Display respective texts after checking if room is launched
        clone.getElementById("launchDisplay-" + room.id).innerHTML = (room.launch) ? "<b>Launched</b>" : "<b>Not launched</b>";
        clone.getElementById("priceDisplay-" + room.id).innerHTML = "<b>$" + room.price + "</b>/hr";
        clone.getElementById("editRoomButton-" + room.id).addEventListener("click", editButtonClicked);

        document.getElementById("roomList").appendChild(clone);
        document.getElementById("roomList").lastElementChild.id = room.id;
        
    }
}

// Helps set clone children's id
function setElementId(clone, roomId) {
    const cloneElement = clone.children[0].children[0].children[0];
    
    cloneElement.id = cloneElement.id + "-" + roomId;
    for (let i = 0; i < cloneElement.childNodes.length; i++) {
        const element = cloneElement.childNodes[i];
        if (element.id) {
            element.id = element.id + "-" + roomId;
        }
    }
}

// Create new room
function addRoom(type, capacity, location, desc, price, image, launch) {
    let room = {
        id: Date.now(),
        type: type,
        capacity: capacity,
        location: location,
        description: desc,
        price: price,
        image: image,
        launch: launch,
        booked: []
    }
    rooms.push(room);
    console.log("Added", {rooms});
    saveRooms();
    window.location.reload();
}

function checkImage(ev) {
    console.log(ev.files[0]);
    const previewImg = document.getElementById("previewImg");
    const uploadImage = ev.files[0];
    if (uploadImage) {
        const reader = new FileReader();
        reader.addEventListener("load", function() {
            previewImg.setAttribute("src", this.result);
        });
        reader.readAsDataURL(uploadImage);
    }
    else {
        previewImg.setAttribute("src", "");
    }
}

// Display new room form
function displayForm(form) {
    document.getElementById(form).style.display = "block";
}

// Close new room form
function closeForm() {
    document.getElementById("modalForm").style.display = "none";
    document.getElementById("formType").value = "Small";
    document.getElementById("formCapacity").value = "1";
    document.getElementById("formLocation").value = "";
    document.getElementById("formDescription").value = "";
    document.getElementById("formPrice").value = "";
    document.getElementById("formImage").value = "";
    document.getElementById("errorMsg").innerHTML = "";
    document.getElementById("previewImg").src = "";
}

// Check form price value on change
function checkPriceValue(obj) {
    if (obj.value < 0) {
        obj.value = 0.01;
    }
    obj.value = parseFloat(obj.value).toFixed(2);
}

// Check form capacity value on change
function checkCapValue(obj) {
    if (obj.value > 10) {
        obj.value = 10;
    }
    if (obj.value < 1) {
        obj.value = 1;
    }
    
}

// Edit room button
function editButtonClicked(ev) {
    const editRoom = getRoomById(getRoomIdByElement(ev.target.id));
    document.getElementById("editDiv").style.display = 'block';

    document.getElementById("currentId").innerHTML = editRoom.id;
    document.getElementById("editId").innerHTML = "Room ID: " + editRoom.id;
    document.getElementById("editType").value = editRoom.type;
    document.getElementById("editCapacity").value = editRoom.capacity;
    document.getElementById("editLocation").value = editRoom.location;
    document.getElementById("editDescription").value = editRoom.description;
    document.getElementById("editPrice").value = editRoom.price;
    document.getElementById("editLaunch").checked = editRoom.launch;
}

// Get form values
function newRoomForm() {
    console.log(document.getElementById("formType").value);
    console.log(document.getElementById("formCapacity").value);
    console.log(document.getElementById("formLocation").value);
    console.log(document.getElementById("formDescription").value);
    console.log(document.getElementById("formPrice").value);
    console.log(document.getElementById("previewImg").src);

    if (document.getElementById("formType").value.length != 0 &&
        document.getElementById("formCapacity").value.length != 0 &&
        document.getElementById("formLocation").value.length != 0 &&
        document.getElementById("formDescription").value.length != 0 &&
        document.getElementById("formPrice").value.length != 0 &&
        document.getElementById("formImage").files[0]) {

        addRoom(
            document.getElementById("formType").value,
            document.getElementById("formCapacity").value,
            document.getElementById("formLocation").value,
            document.getElementById("formDescription").value,
            document.getElementById("formPrice").value,
            document.getElementById("previewImg").src,
            document.getElementById("roomLaunch").checked
        );
    }
        
    else {
        document.getElementById("errorMsg").innerHTML = "Field(s) are empty !";
    }
}

// Display promo form
function displayPromos() {
    refreshPromos();
    // const temp = document.getElementById("promoTemp").content;
    
    if (promos.length == 0) {
        document.getElementById("removePromoList").style.display = "none";
    }
    else {
        const trashIcon = '<i class="material-icons">delete</i>Delete';
        for (let i = 0; i < promos.length; i++) {
            const promo = promos[i];
            const row = document.createElement("tr");
            const dataCode = document.createElement("td"); 
            const dataDiscount = document.createElement("td");
            const dataButton = document.createElement("button");
            row.id = promo.code;
            dataCode.innerHTML = promo.code;
            dataDiscount.innerHTML = promo.discount;
            dataButton.className = "all-btn";
            dataButton.setAttribute("onclick", "deletePromoCode(this)");
            dataButton.innerHTML = trashIcon;
            row.appendChild(dataCode);
            row.appendChild(dataDiscount);
            row.appendChild(dataButton);
            document.getElementById("promoTableBody").appendChild(row);
        }
        document.getElementById("removePromoList").style.display = "block";
    }
    document.getElementById("managePromoDiv").style.display = "block";
}

// Hide promo form
function cancelManagePromo() {
    document.getElementById("managePromoDiv").style.display = "none";
}

// Delete promo code
function deletePromoCode(promoBtn) {
    console.log(promoBtn.parentElement.id);
    console.log(promos.find(deletePromo => deletePromo.code == promoBtn.parentElement.id));
    const index = promos.indexOf(promos.find(deletePromo => deletePromo.code == promoBtn.parentElement.id));
    console.log(index);
    promos.splice(index, 1);
    refreshPromos();
    displayPromos();
    savePromos();
}

// Create promo button
function getPromoCode() {
    const newPromoCode = document.getElementById("createPromoCode");
    const newPromoDiscount = document.getElementById("createPromoDiscount");

    // Check valid promo code
    if (newPromoCode.value.length < 5) {
        document.getElementById("promoErrorMsg").innerHTML = "Promo code needs to be at least 5 characters.";
        return;
    }
    else if (newPromoCode.value.length > 15) {
        document.getElementById("promoErrorMsg").innerHTML = "Promo code needs to be less than 15 characters.";
        return;
    }
    else {
        document.getElementById("promoErrorMsg").innerHTML = "";
    }

    // Check valid discount
    if (newPromoDiscount.value > 0 && newPromoDiscount.value <= 100) {
        document.getElementById("promoErrorMsg").innerHTML = "";
    }
    else {
        document.getElementById("promoErrorMsg").innerHTML = "Discount needs to be between 1 to 100 (%).";
        return;
    }
    // Create promo code
    createPromoCode(newPromoCode.value, newPromoDiscount.value);
    
    newPromoCode.value = "";
    newPromoDiscount.value = "";

    // Refresh and display new code
    refreshPromos();
    displayPromos();
}

// Add promo to array
function createPromoCode(newPromoCode, newPromoDiscount) {
    let promo = {
        code: newPromoCode,
        discount: newPromoDiscount
    }
    promos.push(promo);
    savePromos();
}

// Deletes all promos and displays it
function refreshPromos() {
    const promoTable = document.getElementById("promoTableBody");
    // Remove all promos
    for (let i = 0; i < (promoTable.childNodes.length-1); i++) {
        console.log(promoTable.childNodes.length);
        
        promoTable.lastElementChild.remove();
    }
}

// Saves promos to localStorage
function savePromos() {
    localStorage.setItem("promos", JSON.stringify(promos));
}

// Close edit form
function cancelEdit(ev) {
    console.log("cancel edit");
    document.getElementById("editDiv").style.display = 'none';

    document.getElementById("currentId").innerHTML = "";
    document.getElementById("editId").innerHTML = "";
    document.getElementById("editType").value = "";
    document.getElementById("editDescription").value = "";
    document.getElementById("editCapacity").value = "";
    document.getElementById("editPrice").value = "";
    document.getElementById("editLaunch").checked = false;
}

// Save edit room form
function editRoomForm() {
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (room.id == document.getElementById("currentId").innerHTML) {
            rooms[i].type = document.getElementById("editType").value;
            rooms[i].capacity = document.getElementById("editCapacity").value;
            rooms[i].location = document.getElementById("editLocation").value;
            rooms[i].description = document.getElementById("editDescription").value;
            rooms[i].price = document.getElementById("editPrice").value;
            rooms[i].launch = document.getElementById("editLaunch").checked;
            console.log(rooms[i]);
            saveRooms();
        }
    }
    cancelEdit();
    window.location.reload();
}

// Delete the current editing room
function deleteRoom() {
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (room.id == document.getElementById("currentId").innerHTML) {
            // resetRoomBookings(room);
            removeRoomFromUser(room.id);
            rooms.splice(i, 1);
            saveRooms();
            window.location.reload();
        }
    }
}

// Delete room, delete user bookings
function removeRoomFromUser(roomId) {
    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        console.log(account);
        console.log("Check against: ", roomId);
        // for (let j = 0; j < account.booked.length; j++) {
        for (let j = account.booked.length - 1; j >= 0 ; j--) {
            const booking = account.booked[j];
            console.log("Checking: ", booking.roomId);

            if (booking.roomId == roomId) {
                console.log("Removing: ", account.booked[j]);
                account.booked.splice(j, 1);
                console.log(account.booked);
                saveRooms();
                saveAcc();
                window.location.reload();
            }
        }
    }
}

// Pass id and returns room
function getRoomById(id) {
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (room.id == id) {
            return room;
        }
    }
    return null;
}

// Pass any object with room reference ID and returns the room id
function getRoomIdByElement(obj) {
    var str = obj.split("-");
    return str[(str.length-1)];
}

// Save rooms array into local storage
function saveRooms() {
    localStorage.setItem("rooms", JSON.stringify(rooms));
}

function confirmDelete() {
    document.getElementById("confirmModal").style.display = 'block';
}

function deleteNo() {
    document.getElementById("confirmModal").style.display = 'none';
}

// Create account
function createAcc() {
    const newUsername = document.getElementById("username").value.toLowerCase();
    const newEmail = document.getElementById("email").value;
    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        if (account.username == newUsername) {
            document.getElementById("errorMsg").innerHTML = "Username already exists !";
            return;
        }
        else if (account.email == newEmail) {
            document.getElementById("errorMsg").innerHTML = "Email already exists !";
            return;
        }
    }
    console.log("Full Name:", document.getElementById("fullName").value.toLowerCase());
    console.log("Username:", document.getElementById("username").value);
    console.log("Password:", document.getElementById("password").value);
    console.log("Email:", document.getElementById("email").value);
    console.log("Suspended:", document.getElementById("suspended").checked);
    console.log("Profile pic:", document.getElementById("profileImg").files[0]);
    const typeRadio = document.getElementsByName("userType");
    var userType;
    for (let i = 0; i < typeRadio.length; i++) {
        if (typeRadio[i].checked) {
            console.log("User type:", typeRadio[i].value);
            userType = typeRadio[i].value;
        }
    }
    if (document.getElementById("profileImg").files[0]) {
        addAcc(
            document.getElementById("fullName").value,
            document.getElementById("username").value,
            document.getElementById("password").value,
            document.getElementById("email").value,
            userType,
            document.getElementById("suspended").checked,
            document.getElementById("previewImg").src
        );
    }
    else {
        addAcc(
            document.getElementById("fullName").value,
            document.getElementById("username").value,
            document.getElementById("password").value,
            document.getElementById("email").value,
            userType,
            document.getElementById("suspended").checked,
        );
    }
    window.location.reload();
}

// Creates account class
function addAcc(name, username, password, email, userType, suspended, profilePic) {
    console.log(name, username, password, email, userType, suspended, profilePic);
    if (!profilePic) {
        console.log("No profile pic");
        profilePic = "";
    }
    let account = {
        name: name,
        username: username,
        password: password,
        email: email,
        userType: userType,
        suspended: suspended,
        profilePic: profilePic,
        booked: [],
        logHistory: []
    }
    accounts.push(account);
    console.log({accounts});
    saveAcc();
}

// Saves acc to localStorage
function saveAcc() {
    localStorage.setItem("accounts", JSON.stringify(accounts));
    if (localStorage.getItem("loginUser")) {
        curAcc = accounts.find(findCurUser);
        localStorage.setItem("loginUser", JSON.stringify(curAcc));
    }
}

// Converts return key to br line
function convertNewLine(text) {
    return text.replace(/(?:\r\n|\r|\n)/g, "<br>");
}

// Manage Users Page
function manageUserReady() {
    console.log("manageusers loaded");
    const temp = document.getElementById("manageUsersTemp").content;
    
    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        if (account.username == "admin") {
            continue;
        }

        
        const clone = temp.cloneNode(true);
        const userDiv = clone.getElementById("manageUser");
        clone.getElementById("editBtn").addEventListener("click", editBtnClicked);
        clone.getElementById("historyBtn").addEventListener("click", historyBtnClicked);
        for (let j = 0; j < userDiv.childNodes.length; j++) {
            const userElements = userDiv.childNodes[j];
            userElements.id += "-" + account.username;
            console.log(userElements);
        }
        console.log(clone.childNodes);
        
        const manageUserPic = clone.getElementById("manageUserPic");
        manageUserPic.id += "-" + account.username;
        if (account.profilePic) {
            manageUserPic.src = account.profilePic;
        }
        const nameContent = clone.getElementById("nameContent");
        const usernameContent = clone.getElementById("usernameContent");
        nameContent.id += "-" + account.username;
        usernameContent.id += "-" + account.username;
        nameContent.innerHTML = "Name: " + account.name;
        usernameContent.innerHTML = "Username: " + account.username;
        
        

        document.getElementById("userList").append(clone);
        document.getElementById("userList").lastElementChild.id = account.username;
    }
}

function editBtnClicked(ev) {
    const editingAcc = accounts.find(curEditId => curEditId.username == ev.target.parentElement.id);
    console.log(editingAcc);
    
    document.getElementById("editFullName").value = editingAcc.name;
    document.getElementById("editUsernameTitle").innerHTML = document.getElementById("editUsername").value = editingAcc.username;
    document.getElementById("editEmail").value = editingAcc.email;
    document.getElementById("editSuspended").checked = editingAcc.suspended;
    
    const userTypes = document.getElementsByName("editUserType");
    for (let i = 0; i < userTypes.length; i++) {
        const userType = userTypes[i];
        if (userType.value == editingAcc.userType) {
            console.log("User type:", userType.value);
            userType.checked = true;
        }
    }
    
    document.getElementById("editUserForm").style.display = "block";
}

function closeEditUserForm() {
    document.getElementById("editUsernameTitle").innerHTML = "";
    document.getElementById("editFullName").value = "";
    document.getElementById("editUsername").value = "";
    document.getElementById("editPassword").value = "";
    document.getElementById("editEmail").value = "";
    document.getElementById("editSuspended").value = "";
    const disableTypes = document.getElementsByName("editUserType");
    for (let i = 0; i < disableTypes.length; i++) {
        const type = disableTypes[i];
        type.checked = false;
    }
    document.getElementById("editUserForm").style.display = "none";
}

// Save edited user details
function editSaveAcc() {
    const editUserId = accounts.find(update => update.username == (document.getElementById("editUsernameTitle").innerHTML)).username;
    console.log(editUserId);
    
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].username == editUserId) {
            console.log(accounts[i]);

            accounts[i].name = document.getElementById("editFullName").value;
            console.log(accounts[i].name);

            accounts[i].username = document.getElementById("editUsername").value;
            console.log(accounts[i].username);

            accounts[i].email = document.getElementById("editEmail").value;
            console.log(accounts[i].email);

            accounts[i].suspended = document.getElementById("editSuspended").checked;
            console.log(accounts[i].suspended);

            // Update password
            if (document.getElementById("editPassword").value) {
                accounts[i].password = document.getElementById("editPassword").value;
                console.log("Password changed to", document.getElementById("editPassword").value);
            }

            // Update userType
            const userTypes = document.getElementsByName("editUserType");
            console.log(userTypes);
            
            for (let j = 0; j < userTypes.length; j++) {
                const userType = userTypes[j];
                if (userType.checked) {
                    console.log("User type checked:", userType.value);
                    accounts[i].userType = userType.value;
                }
            }
        }
    }
    saveAcc();
    window.location.reload();
    console.log({accounts});
}

function historyBtnClicked(ev) {
    const activityHistoryAcc = accounts.find(curId => curId.username == ev.target.parentElement.id);
    document.getElementById("usernameTitle").innerHTML = activityHistoryAcc.username;
    for (let i = 0; i < activityHistoryAcc.logHistory.length; i++) {
        const logActivity = activityHistoryAcc.logHistory[i];
        console.log(logActivity);
        const row = document.createElement("tr");
        const activity = document.createElement("td"); 
        const dateTime = document.createElement("td");
        activity.innerHTML = logActivity.activity;
        dateTime.innerHTML = logActivity.date + ", " + logActivity.time;
        row.appendChild(activity);
        row.appendChild(dateTime);
        document.getElementById("activityHistoryTableBody").appendChild(row);
    }
    document.getElementById("activityHistoryDiv").style.display = "block";
}

function closeActivityHistory() {
    const activityTableBody = document.getElementById("activityHistoryTableBody");
    while (activityTableBody.lastChild) {
        activityTableBody.removeChild(activityTableBody.lastChild);
    }
    console.log("display none");
    document.getElementById("activityHistoryDiv").style.display = "none";
}

// --- Booking Page ---
function bookingPageReady() {
    if (!localStorage.getItem("bookingRoom")) {
        window.location.assign("index.html");
        return;
    }
    window.onbeforeunload = leaveBooking;
    console.log("booking page loaded");
    
    const room = getRoomById(localStorage.getItem("bookingRoom"));
    document.getElementById("detailsImg").src = room.image;
    document.getElementById("detailsType").innerHTML = room.type + " room";
    document.getElementById("detailsCapacity").innerHTML = room.capacity + " person(s)";
    document.getElementById("detailsLocation").innerHTML = convertNewLine(room.location);
    document.getElementById("detailsDescription").innerHTML = convertNewLine(room.description);
    document.getElementById("detailsPrice").innerHTML = "<b>$" + room.price + "</b>/hr";

    // Set min/max date
    document.getElementById("datePicker").min = setMinDate();
    document.getElementById("datePicker").max = setMaxDate();

    document.getElementById("bookBtn").addEventListener("click", bookRoom);
}

// Remove bookingRoom storage item when booking page unloads
function leaveBooking() {
    if (localStorage.getItem("bookingRoom")) {
        localStorage.removeItem("bookingRoom");
    }
    // return "Leaving booking page !";
}

// Get min date
function setMinDate() {
    const dt = new Date();
    // Set minimum date
    return (dt.getFullYear() + "-" + convertMonthDate((dt.getMonth()+1)) + "-" + convertMonthDate(dt.getDate()));
}

// Get max date
function setMaxDate() {
    const maxPeriodInMonths = 1;
    var temp = new Date();
    var dt = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
    dt.setMonth(dt.getMonth() + maxPeriodInMonths);
    return (dt.getFullYear() + "-" + convertMonthDate((dt.getMonth()+1)) + "-" + convertMonthDate(dt.getDate()));
}

// Adds 0 infornt of month and date <= 9 
function convertMonthDate(monthDate) {
    if (monthDate <= 9) {
        monthDate = "0" + monthDate;
        return monthDate;
    }
    else return monthDate;
}

// Display/hide timing based on date chosen
function checkDate() {
    const chosenDate = document.getElementById("datePicker");
    const timings = document.getElementsByName("timings");
    
    if (chosenDate.value < setMinDate() || chosenDate.value > setMaxDate()) {
        chosenDate.value = "";
        document.getElementById("timeError").innerHTML = "Date is out of range allowed !";
    }

    // Hide timings checkboxes
    if (!document.getElementById("datePicker").value) {
        for (let i = 0; i < timings.length; i++) {
            const timing = timings[i];
            timing.checked = false;
            timing.disabled = false;
        }
        document.getElementById("totalPrice").innerHTML = "<b>$$0.00</b>";
        document.getElementById("timeDisplay").style.visibility = "hidden";
    }

    // Show timings checkboxes
    else {
        const bookedDates = getRoomById(localStorage.getItem("bookingRoom")).booked;
        for (let j = 0; j < timings.length; j++) {
            const timing = timings[j];
            
            timing.checked = false;
            timing.disabled = false;
        }
        for (let i = 0; i < bookedDates.length; i++) {
            const bookedDate = bookedDates[i];
            // If date matches, disable the unavailble timings
            if (bookedDate.date == chosenDate.value) {
                document.getElementById("time" + bookedDate.time).checked = true;
                document.getElementById("time" + bookedDate.time).disabled = true;
            }
        }
        document.getElementById("bookBtn").disabled = true;
        document.getElementById("timeDisplay").style.visibility = "visible";
    }
    updatePrices();
}

// Check if reached booking limit for timing
function checkTimeCheckboxes(checkbox) {
    // Maximum number of bookings per user
    const limit = 3;
    const userLimit = limit - curAcc.booked.length;
    var currentChecked = 0;
    const allTimeCheckbox = document.getElementsByName("timings");
    
    for (let i = 0; i < allTimeCheckbox.length; i++) {
        const timeCheckbox = allTimeCheckbox[i];
        // Confirm check time
        if (timeCheckbox.checked && !timeCheckbox.disabled) {
            currentChecked++;
            document.getElementById("timeError").innerHTML = "";
            document.getElementById("bookBtn").disabled = false;
        }
    }
    
    // If checks over user limit
    if (currentChecked > userLimit) {
        document.getElementById("timeError").innerHTML = "You have reached the maximum bookings allowed.";
        checkbox.checked = false;
        currentChecked--;
    }
    else {
        document.getElementById("timeError").innerHTML = "";
    }
    updatePrices();
}

function updatePrices() {
    // All timings checkboxes
    const allTimeCheckbox = document.getElementsByName("timings");
    // All timings checkboxes checked
    var checked = 0;
    for (let i = 0; i < allTimeCheckbox.length; i++) {
        if (allTimeCheckbox[i].checked && !allTimeCheckbox[i].disabled) {
            checked++;
        }
    }
    console.log("checked:", checked);
    
    if (checked == 0) {
        document.getElementById("totalPrice").innerHTML = "<b>$0.00</b>";
        document.getElementById("totalPriceDiscount").innerHTML = "<b>$0.00</b>";
        document.getElementById("totalPriceDiscountDiv").style.display = "none";
        document.getElementById("bookBtn").disabled = true;
        return;
    }
    // Booking price
    const roomPrice = getRoomById(localStorage.getItem("bookingRoom")).price;
    // Booking price * number of timings checked
    const totalPrice = parseFloat(checked * roomPrice).toFixed(2);
    // Promo code entered
    const promoEntered = document.getElementById("promoCode");
    document.getElementById("totalPrice").innerHTML = "<b>$" + totalPrice + "</b>";

    console.log(document.activeElement);
    // Booking price after discount
    if (promoEntered.value) {
        // If promo code not in focus
        if (document.activeElement != promoEntered) {
            // Find promo from array
            const promo = promos.find(findPromo => findPromo.code == promoEntered.value);
            if (promo) {
                document.getElementById("bookError").innerHTML = "";
                // updatePriceDiscount(1-(promo.discount*0.01));
                const discountRate = (1-(promo.discount*0.01));
                const totalPriceDiscount = (totalPrice * discountRate).toFixed(2);
                document.getElementById("totalPriceDiscount").innerHTML = "<b>$" + totalPriceDiscount + "</b>";
                document.getElementById("totalPriceDiscountDiv").style.display = "block";
            }
            else {
                document.getElementById("totalPriceDiscountDiv").style.display = "none";
                document.getElementById("totalPriceDiscount").innerHTML = "";
                document.getElementById("bookError").innerHTML = "Promo code does not exist !";
            }
        }
    }
    // If promo code not entered
    else {
        document.getElementById("totalPriceDiscountDiv").style.display = "none";
        document.getElementById("totalPriceDiscount").innerHTML = "";
    }
    document.getElementById("bookBtn").disable = true;
}

// Check if promo code exists and returns promo discount amount
function checkPromoCode() {
    if (document.getElementById("promoCode").value) {
        const promoEntered = document.getElementById("promoCode").value;
        const promo = promos.find(findPromo => findPromo.code == promoEntered);
        if (promo) {
            document.getElementById("bookError").innerHTML = "";
            updatePriceDiscount(1-(promo.discount*0.01));
        }
        else {
            document.getElementById("bookError").innerHTML = "Promo code does not exist !";
        }
    }
}

// Update discounted price
function updatePriceDiscount(discount) {
    const totalPrice = parseFloat(document.getElementById("totalPrice").innerHTML);
    console.log(totalPrice);
    
    const totalPriceDiscount = totalPrice * discount;
    console.log(totalPriceDiscount);
    document.getElementById("totalPriceDiscount").innerHTML = "<b>$" + totalPriceDiscount + "</b>"
    document.getElementById("totalPriceDiscountDiv").style.display = "block";
}

// Book room button clicked
function bookRoom(event) {
    event.preventDefault();
    // Check card info
    const cardNumber = document.getElementById("cardNumber").value;
    const cardExpiryMonths = document.getElementsByName("cardExpiryMonth");
    const cardExpiryYears = document.getElementsByName("cardExpiryYear");
    var cardExpiryMonth;
    var cardExpiryYear;
    for (let k = 0; k < cardExpiryMonths.length; k++) {
        if (cardExpiryMonths[k].selected) {
            cardExpiryMonth = cardExpiryMonths[k];
        }
    }
    for (let l = 0; l < cardExpiryYears.length; l++) {
        if (cardExpiryYears[l].selected) {
            cardExpiryYear = cardExpiryYears[l];
        }
    }
    const cardCvv = document.getElementById("cardCvv").value;
    // If card number length is 16, card expiry month and year is selected, and cardcvv 
    // Check cvv => is numeric, length == 3, value >= 000, value <= 999
    if (
        cardNumber.length == 16 &&
        cardExpiryMonth &&
        cardExpiryYear &&
        Number.isInteger(parseInt(cardCvv)) &&
        cardCvv.length == 3 &&
        cardCvv >= 0 &&
        cardCvv <= 999
    ) {
        console.log("Card passed !");
        document.getElementById("bookError").innerHTML = "";
    }
    else {
        console.log(("Card failed !"));
        document.getElementById("bookError").innerHTML = "Enter valid credentials.";
        return;
    }
    // Check if user reached limit for bookings
    if (curAcc.booked.length < 3) {
        const date = document.getElementById("datePicker").value;
        const times = document.getElementsByName("timings");
        for (let i = 0; i < times.length; i++) {
            const timeCheckbox = times[i];
            if (timeCheckbox.checked) {
                // const dateTime = (date + "/" + timeCheckbox.value);

                // Saved to user
                let bookedRoom = {
                    roomId: JSON.parse(localStorage.getItem("bookingRoom")),
                    date: date,
                    time: timeCheckbox.value
                }

                // Saved to room
                let bookedUser = {
                    username: curAcc.username,
                    date: date,
                    time: timeCheckbox.value
                }

                // Check for repeated bookings
                for (let j = 0; j < curAcc.booked.length; j++) {
                    const temp = curAcc.booked[j];
                    if (temp.roomId == curAcc.booked.roomId && temp.date == curAcc.booked.date && temp.time == curAcc.booked.time) {
                        console.log(temp);
                        console.warn("Repeat bookings detected !");
                        break;
                    }
                }
                // Add to current account
                curAcc.booked.push(bookedRoom);

                // Add to global rooms
                console.log("Before add to rooms:", getRoomById(localStorage.getItem("bookingRoom")).booked);
                
                getRoomById(localStorage.getItem("bookingRoom")).booked.push(bookedUser);
                console.log("After add to rooms:", getRoomById(localStorage.getItem("bookingRoom")).booked);
                console.log({rooms});
                
            }
        }
        // Add from current account to global accounts
        accounts.find(findCurUser).booked = curAcc.booked;
    }
    else {
        console.log("User reached max bookings allowed", curAcc.booked.length,curAcc.booked);
    }
    // Save and go to book success page
    saveRooms();
    saveAcc();
    localStorage.setItem("bookedRoom", localStorage.getItem("bookingRoom"));
    window.location.assign("bookSuccess.html");
}

// Use accounts.find(findCurUser), returns username in account same as curAcc
function findCurUser(username) {
    return username.username == curAcc.username;
}

// Close new user form
function closeCreateUserForm() {
    document.getElementById("createUserForm").style.display = "none";
}

// Loads viewBookings page
function viewBookingsPageReady() {
    // console.log("curAcc.booked", curAcc.booked[0].date);
    // All same booked rooms with date and time
    let bookedRoom = groupBooking();
    console.log(bookedRoom);
    console.log(curAcc.booked);

    // Create rooms listing
    const temp = document.getElementById("viewRoomTemp").content;
    // Loop through all same rooms with date and time
    for (let k = 0; k < bookedRoom.length; k++) {
        const room = bookedRoom[k];
        const roomElement = getRoomById(room.roomId);
        const clone = temp.cloneNode(true);
        console.log(clone.getElementById("viewRoomBtn"));

        clone.getElementById("viewRoomBtn").id = clone.getElementById("viewRoomBtn").id + "-" + roomElement.id;
        
        setElementId(clone, roomElement.id);

        clone.getElementById("viewRoomImage-" + roomElement.id).src = roomElement.image;
        clone.getElementById("viewRoomName-" + roomElement.id).innerHTML = roomElement.type + " room";
        clone.getElementById("viewCapacity-" + roomElement.id).innerHTML = roomElement.capacity + " person(s)";
        clone.getElementById("viewLocation-" + roomElement.id).innerHTML = convertNewLine(roomElement.location);
        clone.getElementById("viewDesc-" + roomElement.id).innerHTML = convertNewLine(roomElement.description);
        // Set dates and times
        // If date is an array
        if (Array.isArray(bookedRoom[k].date)) {
            for (let l = 0; l < bookedRoom[k].date.length; l++) {
                // Formats month from numeric to string
                const date = convertDateToString(bookedRoom[k].date[l]);
                const dateTime = date.toString() + ", " + bookedRoom[k].time[l] + " hrs";
                clone.getElementById("viewDate-" + roomElement.id).innerHTML += dateTime + "<br>";
                console.log(dateTime);
            }
        }
        // If date is not an array
        else {
            const date = convertDateToString(bookedRoom[k].date);
            const dateTime = date.toString() + ", " + bookedRoom[k].time + " hrs";
            clone.getElementById("viewDate-" + roomElement.id).innerHTML = dateTime;
        }
        clone.getElementById("viewPrice-" + roomElement.id).innerHTML = "<b>$" + roomElement.price + "</b>/hr";
        clone.getElementById("viewRoomBtn-" + roomElement.id).addEventListener("click", viewBtnClicked);

        document.getElementById("roomList").appendChild(clone);
        document.getElementById("roomList").lastElementChild.id = roomElement.id;
    }
}

// Group bookings by room
function groupBooking() {
    let bookedRoom = new Array();
    let tempCurAcc = JSON.parse(JSON.stringify(curAcc));
    for (let i = 0; i < tempCurAcc.booked.length; i++) {
        // Temporary clone of curAcc
        // Each booking
        const bookedTiming = tempCurAcc.booked[i];
        let isSameRoom = false;
        for (let j = 0; j < bookedRoom.length; j++) {
            const diffBookedRoom = bookedRoom[j];            
            if (diffBookedRoom.roomId == bookedTiming.roomId) {
                isSameRoom = true;
                if (Array.isArray(bookedRoom[j].date)) {
                    bookedRoom[j].date.push(tempCurAcc.booked[i].date);
                    bookedRoom[j].time.push(tempCurAcc.booked[i].time);
                    break;
                }
                else {
                    bookedRoom[j].date = [bookedRoom[j].date, bookedTiming.date];
                    bookedRoom[j].time = [bookedRoom[j].time, bookedTiming.time];
                    break;
                }
            }
        }
        if (!isSameRoom) {
            bookedRoom.push(bookedTiming);
        }
    }
    return bookedRoom;
}

// Converts month to word
function convertDateToString(date) {
    return new Date(date).toLocaleDateString("default", { year: "numeric", month: "long", day: "numeric" });
}

// View room button
function viewBtnClicked(ev) {
    console.log("View button clicked", ev.target);
    const editBooking = getRoomIdByElement(ev.target.id);
    console.log(editBooking);

    for (let i = 0; i < curAcc.booked.length; i++) {
        const userBookings = curAcc.booked[i];
        if (userBookings.roomId == editBooking) {
            console.log(userBookings);
            const editIcon = '<i class="material-icons">edit</i>Change';
            const row = document.createElement("tr");
            const editBookTiming = document.createElement("td");
            const editBookButton = document.createElement("button");
            row.id = userBookings.roomId + "/" + userBookings.date + "/" + userBookings.time;
            editBookTiming.innerHTML = userBookings.date + ", " + userBookings.time;
            editBookButton.className = "all-btn";
            editBookButton.id = userBookings.roomId;
            editBookButton.setAttribute("onclick", "changeBookTiming(this)");
            editBookButton.innerHTML = editIcon;
            row.appendChild(editBookTiming);
            row.appendChild(editBookButton);
            document.getElementById("editBookTableBody").appendChild(row);
        }
    }
    document.getElementById("editBookDiv").style.display = "block";
}

// Click on change booking button
function changeBookTiming(btn) {
    document.getElementById("dateChanger").parentElement.id = btn.parentElement.id;
    document.getElementById("dateChanger").value = "";
    document.getElementById("dateChanger").min = setMinDate();
    document.getElementById("dateChanger").max = setMaxDate();
    document.getElementById("changeTimingModal").style.display = "block";
}

// Do checks for date
function checkChangeDate(btn) {
    const roomId = btn.parentElement.id.split("/")[0];
    console.log(roomId);
    
    const chosenDate = document.getElementById("dateChanger");
    const timings = document.getElementsByName("timings");

    if (chosenDate.value < setMinDate() || chosenDate.value > setMaxDate()) {
        chosenDate.value = "";
        document.getElementById("timeError").innerHTML = "Date is out of range allowed !";
    }
    else {
        document.getElementById("timeError").innerHTML = "";
    }

    // Hide timings checkboxes
    if (!document.getElementById("dateChanger").value) {
        for (let i = 0; i < timings.length; i++) {
            const timing = timings[i];
            timing.checked = false;
            timing.disabled = false;
        }
        document.getElementById("timeDisplay").style.visibility = "hidden";
    }

    // Show timings checkboxes
    else {
        const bookedDates = getRoomById(roomId).booked;
        for (let j = 0; j < timings.length; j++) {
            const timing = timings[j];
            
            timing.checked = false;
            timing.disabled = false;
        }
        for (let i = 0; i < bookedDates.length; i++) {
            const bookedDate = bookedDates[i];
            // If date matches, disable the unavailble timings
            if (bookedDate.date == chosenDate.value) {
                document.getElementById("time" + bookedDate.time).checked = true;
                document.getElementById("time" + bookedDate.time).disabled = true;
            }
        }
        // document.getElementById("bookBtn").disabled = true;
        document.getElementById("timeDisplay").style.visibility = "visible";
    }
}

// Do checks for checkbox
function checkChangeTimeCheckboxes(checkbox) {
    var currentChecked = 0;
    const allTimeCheckbox = document.getElementsByName("timings");

    for (let i = 0; i < allTimeCheckbox.length; i++) {
        const timeCheckbox = allTimeCheckbox[i];
        // Confirm check time
        if (timeCheckbox.checked && !timeCheckbox.disabled) {
            currentChecked++;
            document.getElementById("timeError").innerHTML = "";
        }
    }

    if (currentChecked > 1) {
        document.getElementById("timeError").innerHTML = "Only 1 selection allowed.";
        checkbox.checked = false;
        currentChecked--;
    }
    else {
        document.getElementById("timeError").innerHTML = "";
    }
}

// Close form to change booking date and time
function closeChangeDateTime(btn) {
    btn.parentElement.id = "";
    document.getElementById("dateChanger").value = "";
    document.getElementById("timeDisplay").style.visibility = "hidden";
    document.getElementById("changeTimingModal").style.display = "none";
}

// Save changes for changing booking date and time
function confirmChangeDateTime() {
    const allTimeCheckbox = document.getElementsByName("timings");
    const idDateTime = document.getElementById("dateChanger").parentElement.id.split("/");

    for (let i = 0; i < allTimeCheckbox.length; i++) {
        const timeCheckbox = allTimeCheckbox[i];
        if (timeCheckbox.checked) {
            const confirmedDate = document.getElementById("dateChanger").value;
            const confirmedTime = timeCheckbox.value;
            // Loop all current account bookings
            for (let j = 0; j < curAcc.booked.length; j++) {
                const accountBooked = curAcc.booked[j];
                // If old timings match, replace it
                if (accountBooked.roomId == idDateTime[0] &&
                    accountBooked.date == idDateTime[1] &&
                    accountBooked.time == idDateTime[2]) {
                        // Find room with matching room id
                        const room = rooms.find(findRoom => findRoom.id == accountBooked.roomId);
                        console.log(room);
                        // Loops through all 
                        for (let l = 0; l < room.booked.length; l++) {
                            const roomBooking = room.booked[l];
                            console.log(roomBooking);
                            if (roomBooking.username == curAcc.username && roomBooking.date == idDateTime[1] && roomBooking.time == idDateTime[2]) {
                                console.log(roomBooking);
                                roomBooking.date = document.getElementById("dateChanger").value;
                                roomBooking.time = timeCheckbox.value;
                                console.log(room);
                                
                            }
                        }
                        accountBooked.date = document.getElementById("dateChanger").value;
                        accountBooked.time = timeCheckbox.value;
                        accounts.find(findCurUser).booked = curAcc.booked;
                        saveRooms();
                        saveAcc();
                        window.location.reload();
                }
            }
        }
    }
}

// Close edit book room form
function closeEditBookRoom() {
    const tableBody = document.getElementById("editBookTableBody");
    console.log(tableBody);
    
    console.log(tableBody.childNodes);
    
    for (let i = 0; i < tableBody.childNodes.length; i++) {
        const tableRow = tableBody.childNodes[i];
        console.log(tableBody.removeChild(tableBody.childNodes[i]));
    }
    document.getElementById("editBookDiv").style.display = "none";
}

// Load book success page
function bookSuccessReady() {
    if (localStorage.getItem("bookedRoom")) {
        const bookedRoom = getRoomById(localStorage.getItem("bookedRoom"));
        document.getElementById("roomType").innerHTML = bookedRoom.type + " room";
        document.getElementById("roomCapacity").innerHTML = bookedRoom.capacity + " person(s)";
        document.getElementById("roomLocation").innerHTML = convertNewLine(bookedRoom.location);
        document.getElementById("roomDescription").innerHTML = convertNewLine(bookedRoom.description);
    }
    else {
        window.location.assign("index.html");
    }
    window.onbeforeunload = leaveBookSuccess;
}

// Leave book success page
function leaveBookSuccess() {
    localStorage.removeItem("bookedRoom");
}

// Remove all bookings that are past
function setPastDate() {
    const curDate = new Date();
    // curDate.setMonth(curDate.getMonth()+1);
    console.log(curDate);
    
    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        console.log(account);
        
        for (let j = account.booked.length - 1; j >= 0 ; j--) {
            const booking = account.booked[j]; 
            console.log(booking);
            
            const dateArr = booking.date.split("-");
            let bookedDate = new Date();
            bookedDate.setFullYear(dateArr[0], (dateArr[1]-1), dateArr[2]);
            
            if (curDate > bookedDate) {
                console.log("Booking date has past !");

                account.booked.splice(j, 1);

            }
        }
    }
    
    for (let k = 0; k < rooms.length; k++) {
        const room = rooms[k];
        for (let l = room.booked.length - 1; l >= 0 ; l--) {
            const userBooking = room.booked[l];
            const dateArr = userBooking.date.split("-");
            let bookedDate = new Date();
            bookedDate.setFullYear(dateArr[0], (dateArr[1]-1), dateArr[2]);
            console.log("Current date: ", curDate);
            console.log("Booked date: ", bookedDate);
            
            if (curDate > bookedDate) {
                console.log("Booking date has past !");
                room.booked.splice(l, 1);
            }
        }
    }
    saveAcc();
    saveRooms();
}