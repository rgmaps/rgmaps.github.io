const toggleBtnEl = document.querySelector('.toggle')
const listEl = document.querySelector('.list')
const mapEl = document.querySelector('.map')

// When user clicks "toggle" button, scroll up or down, depending
// on whether the toggle button is currently scrolled near top or bottom
toggleBtnEl.addEventListener('click', () => {
  const viewportOffset = toggleBtnEl.getBoundingClientRect()
  const containerHeight = toggleBtnEl.parentNode.clientHeight
  const containerMidPoint = containerHeight / 2
  const isScrolledUp = (viewportOffset.top >= containerMidPoint)
  const scrollOpts = { behavior: 'smooth' }
  if (isScrolledUp) {
    listEl.scrollIntoView(scrollOpts)
    document.getElementById("togglebutton").innerHTML = "<h3> &crarr; &nbsp; Return to 3D</h3>"
  } else {
    mapEl.scrollIntoView(scrollOpts)
    document.getElementById("togglebutton").innerHTML = "<h3>&plus; &nbsp;Add to this map </h3>"
  }
})
