const xhr = new XMLHttpRequest();
xhr.open("POST", window.location.href, true);
xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
xhr.send("price=677");
