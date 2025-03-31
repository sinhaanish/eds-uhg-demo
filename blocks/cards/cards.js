import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  /* Existing logic */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  /* New logic to fetch and display data from the URL */
  const url = 'https://publish-p50155-e1550636.adobeaemcloud.com/us/en/magazine.html';
  let data;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    data = [...doc.querySelectorAll('.magazine-card')]; // Adjust the selector based on the structure of the page
  } catch (error) {
    console.error('Error fetching data:', error);
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Failed to load additional content.';
    block.append(errorMessage);
    return;
  }

  /* Append fetched data to the existing list */
  data.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'cards-card';

    // Extract and append image
    const img = item.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      li.append(optimizedPic);
    }

    // Extract and append title or body content
    const title = item.querySelector('.magazine-title'); // Adjust selector as needed
    const body = item.querySelector('.magazine-body'); // Adjust selector as needed
    if (title) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'cards-card-title';
      titleDiv.textContent = title.textContent;
      li.append(titleDiv);
    }
    if (body) {
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'cards-card-body';
      bodyDiv.textContent = body.textContent;
      li.append(bodyDiv);
    }

    ul.append(li);
  });
}