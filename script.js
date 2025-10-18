document.addEventListener('DOMContentLoaded', () => {

    const screen = document.getElementById('first-screen'); // GÜNCELLENDİ
    const historyScreen = document.getElementById('history-screen');
    const buttons = document.querySelectorAll('.btn');

    let currentOperand = '';
    let expressionParts = [];
    let justCalculated = false;

    // ana ekranı günceller
    function updateDisplay() {
        if (currentOperand !== '') {
            screen.innerText = currentOperand;
        } else if (expressionParts.length > 0 && !justCalculated) {
            screen.innerText = expressionParts[expressionParts.length - 2] || '0';
        } else if (justCalculated) {
             screen.innerText = currentOperand;
        }
        else {
            screen.innerText = '0';
        }
    }

    /**
     * işlem geçmişi ekranını günceller.
     * @param {string} [overrideText=null] 
     */
    function updateHistoryDisplay(overrideText = null) {
        if (overrideText !== null) {
            historyScreen.innerText = overrideText;
        } else {
            historyScreen.innerText = expressionParts.join(' ');
        }
    }

    // Her şeyi temizle
    function allClear() {
        currentOperand = '';
        expressionParts = [];
        justCalculated = false;
        updateDisplay();
        updateHistoryDisplay();
    }

    // Sadece mevcut girişi temizle
    function clearEntry() {
        if (justCalculated) {
            allClear();
            return;
        }
        currentOperand = '';
        updateDisplay();
    }
    
    // Rakam veya ondalık nokta ekleme
    function appendCharacter(char) {
        if (justCalculated) {
            allClear();
        }
        justCalculated = false;

        if (char === '.' && currentOperand.includes('.')) return;
        if (char === '00' && currentOperand === '0') return;
        
        if (currentOperand === '0' && char !== '.') {
            currentOperand = char;
        } else {
            currentOperand = currentOperand.toString() + char.toString();
        }
        updateDisplay();
    }

    // İşlem seçme
    function chooseOperation(op) {
        if (currentOperand === '' && expressionParts.length > 0) {
            const lastPart = expressionParts[expressionParts.length - 1];
            if (['+', '-', 'X', '÷'].includes(lastPart)) {
                expressionParts[expressionParts.length - 1] = op;
                updateHistoryDisplay();
                return;
            }
        }

        if (currentOperand === '') return;

        expressionParts.push(parseFloat(currentOperand));
        expressionParts.push(op);
        
        currentOperand = '';
        justCalculated = false;
        updateDisplay();
        updateHistoryDisplay();
    }

    // Karakök ve Yüzde işlemleri
    function handleSpecialOperation(op) {
        if (currentOperand === '') return;
        const current = parseFloat(currentOperand);
        if (isNaN(current)) return;

        let result;
        let operationDesc = '';

        if (op === '√') {
            if (current < 0) {
                alert("Negatif sayının karekökü alınamaz.");
                return;
            }
            result = Math.sqrt(current);
            operationDesc = `√(${current})`;
        } 
        else if (op === '%') {
            if (expressionParts.length > 0) {
                const lastNumber = expressionParts[expressionParts.length - 2];
                if (lastNumber) {
                    result = lastNumber * (current / 100);
                    operationDesc = `${lastNumber} % ${current}`;
                } else {
                    result = current / 100;
                    operationDesc = `${current}%`;
                }
            } else {
                result = current / 100;
                operationDesc = `${current}%`;
            }
        }

        currentOperand = result.toString();
        justCalculated = false; 
        updateDisplay();
        
        updateHistoryDisplay(operationDesc);
        setTimeout(() => {
            updateHistoryDisplay(); 
        }, 1000); 
    }

    // İşlem önceliğine göre eşittir işlemi
    function compute() {
        if (currentOperand === '' && expressionParts.length === 0) return;
        if (currentOperand === '' && ['+', '-', 'X', '÷'].includes(expressionParts[expressionParts.length - 1])) return;

        if (currentOperand !== '') {
            expressionParts.push(parseFloat(currentOperand));
        }

        const fullExpressionForHistory = expressionParts.join(' ');

        let tempExpression = [...expressionParts];

        // Çarpma-Bölme 
        let i = 0;
        while (i < tempExpression.length) {
            const operator = tempExpression[i];
            if (operator === 'X' || operator === '÷') {
                const left = tempExpression[i - 1];
                const right = tempExpression[i + 1];
                let result;

                if (operator === 'X') {
                    result = left * right;
                } else { 
                    if (right === 0) {
                        alert("Hata: Sıfıra bölme işlemi yapılamaz.");
                        allClear();
                        return;
                    }
                    result = left / right;
                }
                
                tempExpression.splice(i - 1, 3, result);
                i = 0;
            } else {
                i++;
            }
        }

        // Toplama (+) ve Çıkarma (-)
        let finalResult = tempExpression[0];
        i = 1;
        while (i < tempExpression.length) {
            const operator = tempExpression[i];
            const right = tempExpression[i + 1];

            if (operator === '+') {
                finalResult = finalResult + right;
            } else if (operator === '-') {
                finalResult = finalResult - right;
            }
            i += 2; 
        }

        // Sonucu ve durumu güncelle
        currentOperand = finalResult.toString();
        expressionParts = []; 
        justCalculated = true;
        updateDisplay();
        
        updateHistoryDisplay(fullExpressionForHistory + ' =');
    }

    // Events
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.innerText.trim();

            if (button.classList.contains('number') || buttonText === '.') {
                appendCharacter(buttonText);
            }
            else if (['+', '-', 'X', '÷'].includes(buttonText)) {
                chooseOperation(buttonText);
            }
            else if (buttonText === '√' || buttonText === '%') {
                handleSpecialOperation(buttonText);
            }
            else if (buttonText === '=') {
                compute();
            }
            else if (buttonText === 'AC') {
                allClear();
            }
            else if (buttonText === 'CE') {
                clearEntry();
            }
            else {
                console.warn(`'${buttonText}' tuşu için bir işlev tanımlanmadı.`);
            }
        });
    });

    allClear();
});