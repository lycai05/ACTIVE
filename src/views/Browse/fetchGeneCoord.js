// fetchGeneCoord.js
import axios from '@/plugins/axios';

export async function fetchGeneCoord(geneId) {
  const inputElement = document.getElementById('simple-search');
  
  if (!inputElement) {
    return {
      status: 'error',
      message: 'Search input element not found'
    };
  }

  inputElement.focus();

  try {
    const response = await axios.get('http://47.107.91.5:8888/api/genomehub/genecoords', {
      params: {
        gene_id: geneId
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    const { items } = response.data;
    
    if (!items || items.length === 0) {
      return {
        status: 'error',
        message: `No annotation found for the given gene ${geneId}`
      };
    }

    // Adjust start and end positions
    const start = Math.max(items[0].start - 50000, 0);
    const end = items[0].end + 50000;
    const newValue = `${items[0].chrom}:${start}-${end}`;
    const totalDuration = 200;
    const charDuration = totalDuration / newValue.length;
    let currentIndex = 0;

    function triggerEvent(element, eventType) {
      const event = new Event(eventType, { bubbles: true });
      element.dispatchEvent(event);
    }

    function simulateKeyPress(char, action) {
      const event = new KeyboardEvent(action, {
        key: char,
        code: char,
        charCode: char.charCodeAt(0),
        keyCode: char.charCodeAt(0),
        which: char.charCodeAt(0),
        bubbles: true
      });
      inputElement.dispatchEvent(event);
    }

    function deleteContent() {
      return new Promise((resolve) => {
        inputElement.value = '';
        triggerEvent(inputElement, 'input');
        triggerEvent(inputElement, 'change');
        resolve();
      });
    }

    function typeContent() {
      return new Promise((resolve) => {
        function typeNextLetter() {
          if (currentIndex < newValue.length) {
            const nextChar = newValue[currentIndex];
            simulateKeyPress(nextChar, 'keydown');
            inputElement.value += nextChar;
            simulateKeyPress(nextChar, 'keyup');
            triggerEvent(inputElement, 'input');
            triggerEvent(inputElement, 'change');
            currentIndex++;
            setTimeout(typeNextLetter, charDuration);
          } else {
            simulateKeyPress('Enter', 'keydown');
            simulateKeyPress('Enter', 'keyup');
            triggerEvent(inputElement, 'input');
            triggerEvent(inputElement, 'change');
            resolve();
          }
        }
        typeNextLetter();
      });
    }

    await deleteContent();
    await typeContent();

    return {
      status: 'success',
      message: `Navigating to gene ${geneId} in the browser`
    };

  } catch (error) {
    return {
      status: 'error',
      message: `Error fetching gene coordinates: ${error.message}`
    };
  }
}