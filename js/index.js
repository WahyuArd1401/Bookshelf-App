const books = []
const RENDER_EVENT = 'render-book'
const SAVE_EVENT = 'save-book'
const STORAGE_KEY = 'BOOKSHELF-APPS'

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook')
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault()
    addBook()
    submitForm.reset()
  })

  document.getElementById('searchSubmit').addEventListener('click', (event) => {
    event.preventDefault()
    const searchBookTitle = document.getElementById('searchBookTitle').value.toLowerCase()
    const bookList = document.querySelectorAll('.book_item > h3')
    for (const book of bookList) {
      if (searchBookTitle != '') {
        if (book.innerText.toLowerCase().includes(searchBookTitle.toLowerCase())) {
          book.parentElement.style.display = 'block'
        } else {
          book.parentElement.style.display = 'none'
        }
      } else {
        book.parentElement.style.display = 'block'
      }
    }
  })

  if (isStorageExist()) {
    loadDataFromStorage()
  }
})

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  }
}

function generateId() {
  return +new Date();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id == bookId) {
      return bookItem
    }
  }
  return null
}

function findBookIndex(bookId) {
  for (let index = 0; index < books.length; index++) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1
}

function saveData() {
  if (isStorageExist) {
    const dataParsed = JSON.stringify(books)
    localStorage.setItem(STORAGE_KEY, dataParsed)
    document.dispatchEvent(new Event(SAVE_EVENT))
  }
}

function isStorageExist() {
  if (typeof (Storage) === 'undefined') {
    alert('Browser tidak mendukung web storage')
    return false
  }
  return true
}

function loadDataFromStorage() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
  if (data !== null) {
    for (const bookItem of data) {
      books.push(bookItem)
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT))
}

function makeBook(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject

  const bookTitle = document.createElement('h3')
  bookTitle.innerText = title
  const bookAuthor = document.createElement('p')
  bookAuthor.innerText = `Penulis : ${author}`
  const bookYear = document.createElement('p')
  bookYear.innerText = `Tahun : ${year}`
  const isBookComplete = document.createElement('p')
  isBookComplete.innerText = `Sudah dibaca : ${isCompleted}`
  const actionDiv = document.createElement('div')
  actionDiv.classList.add('action')

  const container = document.createElement('article')
  container.classList.add('book_item')
  container.append(bookTitle, bookAuthor, bookYear, actionDiv)
  container.setAttribute('id', `book-${id}`)

  const deleteButton = document.createElement('button')
  deleteButton.classList.add('red')
  deleteButton.innerText = 'Hapus buku'
  deleteButton.addEventListener('click', () => {
    removeBook(id)
  })

  if (isCompleted) {
    const undoButton = document.createElement('button')
    undoButton.classList.add('green')
    undoButton.innerText = 'Belum dibaca'
    undoButton.addEventListener('click', () => {
      undoBookToCompleted(id)
    })

    actionDiv.append(undoButton, deleteButton)
  } else {
    const checkButton = document.createElement('button')
    checkButton.classList.add('green')
    checkButton.innerText = 'Selesai dibaca'

    checkButton.addEventListener('click', () => {
      addBookToCompleted(id)
    })

    actionDiv.append(checkButton, deleteButton)
  }
  return container
}

function addBook() {
  const inputBookTitle = document.getElementById('inputBookTitle').value
  const inputBookAuthor = document.getElementById('inputBookAuthor').value
  const inputBookYear = parseInt(document.getElementById('inputBookYear').value)
  const inputBookIsComplete = document.getElementById('inputBookIsComplete').checked

  const bookId = generateId()
  const bookObject = generateBookObject(bookId, inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete)

  if (!isDuplicate(inputBookTitle)) {
    books.push(bookObject)
  } else {
    alert('Anda menambahkan buku duplikasi')
  }

  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId)

  if (bookTarget == null) return;

  bookTarget.isCompleted = true
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function undoBookToCompleted(bookId) {
  const bookTarget = findBook(bookId)

  if (bookTarget == null) return;

  bookTarget.isCompleted = false
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId)

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1)
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function isDuplicate(title) {
  let flag = false
  for (const book of books) {
    if (book.title.toLowerCase() === title.toLowerCase()) {
      flag = true
    }
  }
  return flag
}


document.addEventListener(RENDER_EVENT, function () {
  const incompletedBookList = document.getElementById('incompleteBookshelfList')
  const completedBookList = document.getElementById('completeBookshelfList')

  incompletedBookList.innerHTML = ''
  completedBookList.innerHTML = ''

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem)
    if (bookItem.isCompleted) {
      completedBookList.append(bookElement)
    } else {
      incompletedBookList.append(bookElement)
    }
  }
})

document.addEventListener(SAVE_EVENT, () => {
  console.log('Data telah disimpan')
})
