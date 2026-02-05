/* =============================================
   Logan Health - Questionnaire Logic
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    initQuestionnaire();
});

/* =============================================
   Questionnaire State
   ============================================= */
const questionnaireState = {
    currentStep: 1,
    totalSteps: 5,
    data: {
        // Step 1: Measurements
        heightCm: null,
        weightKg: null,
        bmi: null,

        // Step 2: Personal Details
        dobDay: null,
        dobMonth: null,
        dobYear: null,
        age: null,
        ethnicity: null,
        sex: null,

        // Step 3: Weight History
        highestWeightKg: null,
        targetWeightKg: null,

        // Step 4: Medical
        pregnancy: null,
        conditions: [],
        medications: '',
        allergies: '',

        // Step 5: Contact
        fullName: '',
        email: '',
        phone: '',
        contactMethod: 'email',
        consent: false,
        marketing: false
    },
    eligible: null,
    eligibilityReason: ''
};

/* =============================================
   Initialize Questionnaire
   ============================================= */
function initQuestionnaire() {
    populateDateSelects();
    initUnitToggles();
    initBMICalculation();
    initNavigationButtons();
    initConditionalFields();
    initConditionsCheckbox();
    initPaymentButtons();
}

/* =============================================
   Populate Date Selects
   ============================================= */
function populateDateSelects() {
    const daySelect = document.getElementById('dobDay');
    const yearSelect = document.getElementById('dobYear');

    // Populate days
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }

    // Populate years (18-85 years ago)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 18; i >= currentYear - 85; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    // Add change listeners to calculate age
    [daySelect, document.getElementById('dobMonth'), yearSelect].forEach(select => {
        select.addEventListener('change', calculateAge);
    });
}

/* =============================================
   Unit Toggles
   ============================================= */
function initUnitToggles() {
    const unitBtns = document.querySelectorAll('.unit-btn');

    unitBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.dataset.target;
            const unit = this.dataset.unit;
            const container = this.closest('.form-group');
            const siblings = container.querySelectorAll('.unit-btn');

            // Update active button
            siblings.forEach(s => s.classList.remove('active'));
            this.classList.add('active');

            // Toggle input visibility
            const metricInputs = container.querySelector(`#${target}Metric`);
            const imperialInputs = container.querySelector(`#${target}Imperial`);

            if (metricInputs && imperialInputs) {
                if (unit === 'metric') {
                    metricInputs.classList.remove('hidden');
                    metricInputs.style.display = 'flex';
                    imperialInputs.classList.add('hidden');
                    imperialInputs.style.display = 'none';
                } else {
                    metricInputs.classList.add('hidden');
                    metricInputs.style.display = 'none';
                    imperialInputs.classList.remove('hidden');
                    imperialInputs.style.display = 'flex';
                }
            }

            // Recalculate BMI if height/weight toggled
            if (target === 'height' || target === 'weight') {
                calculateBMI();
            }
        });
    });
}

/* =============================================
   BMI Calculation
   ============================================= */
function initBMICalculation() {
    // Height inputs
    const heightCm = document.getElementById('heightCm');
    const heightFt = document.getElementById('heightFt');
    const heightIn = document.getElementById('heightIn');

    // Weight inputs
    const weightKg = document.getElementById('weightKg');
    const weightSt = document.getElementById('weightSt');
    const weightLbs = document.getElementById('weightLbs');

    // Add listeners
    [heightCm, heightFt, heightIn, weightKg, weightSt, weightLbs].forEach(input => {
        if (input) {
            input.addEventListener('input', calculateBMI);
        }
    });
}

function calculateBMI() {
    let heightCm = getHeightInCm();
    let weightKg = getWeightInKg();

    if (heightCm && weightKg && heightCm > 0 && weightKg > 0) {
        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);

        questionnaireState.data.heightCm = heightCm;
        questionnaireState.data.weightKg = weightKg;
        questionnaireState.data.bmi = bmi;

        displayBMI(bmi);
    } else {
        document.getElementById('bmiValue').textContent = '--';
        document.getElementById('bmiCategory').textContent = '';
        document.getElementById('bmiCategory').className = 'bmi-category';
    }
}

function getHeightInCm() {
    const metricActive = document.querySelector('[data-target="height"].unit-btn.active').dataset.unit === 'metric';

    if (metricActive) {
        return parseFloat(document.getElementById('heightCm').value) || null;
    } else {
        const ft = parseFloat(document.getElementById('heightFt').value) || 0;
        const inches = parseFloat(document.getElementById('heightIn').value) || 0;
        if (ft > 0) {
            return (ft * 30.48) + (inches * 2.54);
        }
        return null;
    }
}

function getWeightInKg() {
    const metricActive = document.querySelector('[data-target="weight"].unit-btn.active').dataset.unit === 'metric';

    if (metricActive) {
        return parseFloat(document.getElementById('weightKg').value) || null;
    } else {
        const st = parseFloat(document.getElementById('weightSt').value) || 0;
        const lbs = parseFloat(document.getElementById('weightLbs').value) || 0;
        if (st > 0) {
            return (st * 6.35029) + (lbs * 0.453592);
        }
        return null;
    }
}

function displayBMI(bmi) {
    const bmiValue = document.getElementById('bmiValue');
    const bmiCategory = document.getElementById('bmiCategory');

    bmiValue.textContent = bmi.toFixed(1);

    let category = '';
    let categoryClass = '';

    if (bmi < 18.5) {
        category = 'Underweight';
        categoryClass = 'healthy';
    } else if (bmi < 25) {
        category = 'Healthy';
        categoryClass = 'healthy';
    } else if (bmi < 30) {
        category = 'Overweight';
        categoryClass = 'overweight';
    } else if (bmi < 35) {
        category = 'Obese (Class I)';
        categoryClass = 'obese';
    } else if (bmi < 40) {
        category = 'Obese (Class II)';
        categoryClass = 'obese';
    } else {
        category = 'Obese (Class III)';
        categoryClass = 'obese';
    }

    bmiCategory.textContent = category;
    bmiCategory.className = `bmi-category ${categoryClass}`;
}

/* =============================================
   Age Calculation
   ============================================= */
function calculateAge() {
    const day = document.getElementById('dobDay').value;
    const month = document.getElementById('dobMonth').value;
    const year = document.getElementById('dobYear').value;

    if (day && month && year) {
        const dob = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        questionnaireState.data.dobDay = day;
        questionnaireState.data.dobMonth = month;
        questionnaireState.data.dobYear = year;
        questionnaireState.data.age = age;

        document.getElementById('ageDisplay').textContent = `Age: ${age} years`;
    }
}

/* =============================================
   Conditional Fields
   ============================================= */
function initConditionalFields() {
    // Show pregnancy question only for females
    const sexInputs = document.querySelectorAll('input[name="sex"]');
    sexInputs.forEach(input => {
        input.addEventListener('change', function() {
            const pregnancyGroup = document.getElementById('pregnancyGroup');
            if (this.value === 'female') {
                pregnancyGroup.style.display = 'block';
            } else {
                pregnancyGroup.style.display = 'none';
                // Reset pregnancy value
                const pregnancyInputs = document.querySelectorAll('input[name="pregnancy"]');
                pregnancyInputs.forEach(p => p.checked = false);
            }
        });
    });
}

/* =============================================
   Conditions Checkbox Logic
   ============================================= */
function initConditionsCheckbox() {
    const conditionCheckboxes = document.querySelectorAll('input[name="conditions"]');
    const noneCheckbox = document.querySelector('input[name="conditions"][value="none"]');

    conditionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.value === 'none' && this.checked) {
                // Uncheck all others when "None" is selected
                conditionCheckboxes.forEach(cb => {
                    if (cb !== noneCheckbox) {
                        cb.checked = false;
                    }
                });
            } else if (this.value !== 'none' && this.checked) {
                // Uncheck "None" when any other is selected
                noneCheckbox.checked = false;
            }
        });
    });
}

/* =============================================
   Navigation Buttons
   ============================================= */
function initNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.addEventListener('click', () => navigateStep(-1));
    nextBtn.addEventListener('click', () => navigateStep(1));
    submitBtn.addEventListener('click', submitQuestionnaire);
}

function navigateStep(direction) {
    // Validate current step before moving forward
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }

    // Save current step data
    saveStepData();

    // Update step
    questionnaireState.currentStep += direction;

    // Show/hide steps
    updateStepVisibility();

    // Update progress bar
    updateProgressBar();

    // Update navigation buttons
    updateNavigationButtons();

    // Scroll to top of form
    document.querySelector('.questionnaire-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateStepVisibility() {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach((step, index) => {
        if (index + 1 === questionnaireState.currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function updateProgressBar() {
    const progress = (questionnaireState.currentStep / questionnaireState.totalSteps) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Step ${questionnaireState.currentStep} of ${questionnaireState.totalSteps}`;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.style.display = questionnaireState.currentStep > 1 ? 'inline-flex' : 'none';

    if (questionnaireState.currentStep === questionnaireState.totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    }
}

/* =============================================
   Step Validation
   ============================================= */
function validateCurrentStep() {
    const step = questionnaireState.currentStep;
    let isValid = true;
    let errorMessage = '';

    clearErrors();

    switch (step) {
        case 1:
            // Validate height and weight
            const heightCm = getHeightInCm();
            const weightKg = getWeightInKg();

            if (!heightCm || heightCm < 110 || heightCm > 234) {
                markError('heightCm');
                markError('heightFt');
                errorMessage = 'Please enter a valid height';
                isValid = false;
            }

            if (!weightKg || weightKg < 30 || weightKg > 300) {
                markError('weightKg');
                markError('weightSt');
                errorMessage = 'Please enter a valid weight';
                isValid = false;
            }
            break;

        case 2:
            // Validate DOB
            const day = document.getElementById('dobDay').value;
            const month = document.getElementById('dobMonth').value;
            const year = document.getElementById('dobYear').value;

            if (!day || !month || !year) {
                markError('dobDay');
                markError('dobMonth');
                markError('dobYear');
                errorMessage = 'Please enter your date of birth';
                isValid = false;
            }

            // Validate age
            if (questionnaireState.data.age < 18 || questionnaireState.data.age > 85) {
                markError('dobYear');
                errorMessage = 'You must be between 18 and 85 years old';
                isValid = false;
            }

            // Validate ethnicity
            const ethnicity = document.querySelector('input[name="ethnicity"]:checked');
            if (!ethnicity) {
                errorMessage = 'Please select your ethnicity';
                isValid = false;
            }

            // Validate sex
            const sex = document.querySelector('input[name="sex"]:checked');
            if (!sex) {
                errorMessage = 'Please select your sex';
                isValid = false;
            }
            break;

        case 3:
            // Highest weight is optional if BMI >= 30
            // Target weight is always optional
            break;

        case 4:
            // Check pregnancy if female
            const isFemale = questionnaireState.data.sex === 'female';
            if (isFemale) {
                const pregnancy = document.querySelector('input[name="pregnancy"]:checked');
                if (!pregnancy) {
                    errorMessage = 'Please answer the pregnancy question';
                    isValid = false;
                }
            }
            break;

        case 5:
            // Validate contact details
            const name = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const consent = document.getElementById('consent').checked;

            if (!name || name.length < 2) {
                markError('fullName');
                errorMessage = 'Please enter your full name';
                isValid = false;
            }

            if (!email || !window.utils.isValidEmail(email)) {
                markError('email');
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }

            if (!phone || !window.utils.isValidUKPhone(phone)) {
                markError('phone');
                errorMessage = 'Please enter a valid UK phone number';
                isValid = false;
            }

            if (!consent) {
                errorMessage = 'Please agree to the data processing terms';
                isValid = false;
            }
            break;
    }

    if (!isValid && errorMessage) {
        showError(errorMessage);
    }

    return isValid;
}

function markError(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.classList.add('error');
    }
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    const existingError = document.querySelector('.form-error');
    if (existingError) existingError.remove();
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = 'background: var(--color-error-light); color: var(--color-error); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px;';
    errorDiv.textContent = message;

    const currentStep = document.querySelector('.form-step.active');
    currentStep.insertBefore(errorDiv, currentStep.firstChild);
}

/* =============================================
   Save Step Data
   ============================================= */
function saveStepData() {
    const step = questionnaireState.currentStep;
    const data = questionnaireState.data;

    switch (step) {
        case 1:
            data.heightCm = getHeightInCm();
            data.weightKg = getWeightInKg();
            data.bmi = data.weightKg / Math.pow(data.heightCm / 100, 2);
            break;

        case 2:
            const ethnicity = document.querySelector('input[name="ethnicity"]:checked');
            const sex = document.querySelector('input[name="sex"]:checked');
            data.ethnicity = ethnicity ? ethnicity.value : null;
            data.sex = sex ? sex.value : null;
            break;

        case 3:
            // Get highest weight
            const hwMetric = document.querySelector('[data-target="highestWeight"].unit-btn.active').dataset.unit === 'metric';
            if (hwMetric) {
                data.highestWeightKg = parseFloat(document.getElementById('highestWeightKg').value) || null;
            } else {
                const hwSt = parseFloat(document.getElementById('highestWeightSt').value) || 0;
                const hwLbs = parseFloat(document.getElementById('highestWeightLbs').value) || 0;
                data.highestWeightKg = hwSt > 0 ? (hwSt * 6.35029) + (hwLbs * 0.453592) : null;
            }

            // Get target weight
            const twMetric = document.querySelector('[data-target="targetWeight"].unit-btn.active').dataset.unit === 'metric';
            if (twMetric) {
                data.targetWeightKg = parseFloat(document.getElementById('targetWeightKg').value) || null;
            } else {
                const twSt = parseFloat(document.getElementById('targetWeightSt').value) || 0;
                const twLbs = parseFloat(document.getElementById('targetWeightLbs').value) || 0;
                data.targetWeightKg = twSt > 0 ? (twSt * 6.35029) + (twLbs * 0.453592) : null;
            }
            break;

        case 4:
            const pregnancy = document.querySelector('input[name="pregnancy"]:checked');
            data.pregnancy = pregnancy ? pregnancy.value : null;

            const conditions = document.querySelectorAll('input[name="conditions"]:checked');
            data.conditions = Array.from(conditions).map(c => c.value);

            data.medications = document.getElementById('medications').value.trim();
            data.allergies = document.getElementById('allergies').value.trim();
            break;

        case 5:
            data.fullName = document.getElementById('fullName').value.trim();
            data.email = document.getElementById('email').value.trim();
            data.phone = document.getElementById('phone').value.trim();

            const contactMethod = document.querySelector('input[name="contactMethod"]:checked');
            data.contactMethod = contactMethod ? contactMethod.value : 'email';

            data.consent = document.getElementById('consent').checked;
            data.marketing = document.getElementById('marketing').checked;
            break;
    }
}

/* =============================================
   Submit Questionnaire
   ============================================= */
function submitQuestionnaire(e) {
    e.preventDefault();

    if (!validateCurrentStep()) {
        return;
    }

    saveStepData();

    // Check eligibility
    const eligibility = checkEligibility();
    questionnaireState.eligible = eligibility.eligible;
    questionnaireState.eligibilityReason = eligibility.reason;

    // Submit to Formspree
    submitToFormspree();

    // Show results
    showResults();
}

/* =============================================
   Eligibility Check
   ============================================= */
function checkEligibility() {
    const data = questionnaireState.data;
    let eligible = true;
    let reason = '';

    // Age check
    if (data.age < 18) {
        eligible = false;
        reason = 'You must be at least 18 years old to be eligible for GLP-1 treatment.';
        return { eligible, reason };
    }

    if (data.age > 85) {
        eligible = false;
        reason = 'GLP-1 treatments are not recommended for individuals over 85 years old.';
        return { eligible, reason };
    }

    // Pregnancy check
    if (data.pregnancy === 'yes') {
        eligible = false;
        reason = 'GLP-1 treatments are not suitable during pregnancy, breastfeeding, or while trying to conceive.';
        return { eligible, reason };
    }

    // BMI check with ethnicity adjustment
    const bmiThreshold = data.ethnicity === 'other' ? 27.5 : 30;
    const bmiWithConditionsThreshold = data.ethnicity === 'other' ? 25 : 27;

    // Check if user has weight-related conditions
    const weightRelatedConditions = ['type2diabetes', 'highbloodpressure', 'heartdisease'];
    const hasWeightRelatedCondition = data.conditions.some(c => weightRelatedConditions.includes(c));

    // Calculate highest BMI if provided
    let highestBMI = data.bmi;
    if (data.highestWeightKg && data.heightCm) {
        highestBMI = data.highestWeightKg / Math.pow(data.heightCm / 100, 2);
    }

    // Eligibility based on BMI
    if (data.bmi >= bmiThreshold || highestBMI >= bmiThreshold) {
        eligible = true;
    } else if (data.bmi >= bmiWithConditionsThreshold && hasWeightRelatedCondition) {
        eligible = true;
    } else {
        eligible = false;
        reason = `Based on your BMI of ${data.bmi.toFixed(1)}, you may not currently meet the eligibility criteria for GLP-1 treatment. The minimum BMI requirement is ${bmiThreshold} (or ${bmiWithConditionsThreshold} with weight-related health conditions).`;
    }

    // Check for contraindicated conditions
    const contraindicatedConditions = ['eatingdisorder', 'pancreatitis'];
    const hasContraindication = data.conditions.some(c => contraindicatedConditions.includes(c));

    if (hasContraindication && eligible) {
        // Don't automatically disqualify, but flag for pharmacist review
        reason = 'Based on your medical history, our pharmacist will need to conduct a thorough assessment to determine your suitability for GLP-1 treatment.';
    }

    return { eligible, reason };
}

/* =============================================
   Show Results
   ============================================= */
function showResults() {
    const form = document.getElementById('healthQuestionnaire');
    const resultContainer = document.getElementById('resultContainer');
    const eligibleResult = document.getElementById('eligibleResult');
    const notEligibleResult = document.getElementById('notEligibleResult');

    // Hide form, show results
    form.style.display = 'none';
    resultContainer.style.display = 'block';

    if (questionnaireState.eligible) {
        eligibleResult.style.display = 'block';
        notEligibleResult.style.display = 'none';
        // Payment options are shown instead of direct Calendly booking
    } else {
        eligibleResult.style.display = 'none';
        notEligibleResult.style.display = 'block';

        if (questionnaireState.eligibilityReason) {
            document.getElementById('notEligibleMessage').textContent = questionnaireState.eligibilityReason;
        }
    }

    // Scroll to results
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* =============================================
   Payment Button Handlers
   ============================================= */
// JotForm URLs
const JOTFORM_URLS = {
    'one-off': 'https://pci.jotform.com/form/260355646726059',
    'subscription': 'https://pci.jotform.com/form/260355571683058'
};

function initPaymentButtons() {
    const oneOffBtn = document.getElementById('oneOffPaymentBtn');
    const subscriptionBtn = document.getElementById('subscriptionPaymentBtn');

    if (oneOffBtn) {
        oneOffBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handlePaymentSelection('one-off');
        });
    }

    if (subscriptionBtn) {
        subscriptionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handlePaymentSelection('subscription');
        });
    }
}

function handlePaymentSelection(paymentType) {
    const jotformUrl = JOTFORM_URLS[paymentType];

    if (!jotformUrl || jotformUrl.includes('YOUR_')) {
        console.warn('JotForm URL not configured for:', paymentType);
        alert('Payment form is being set up. Please contact us directly to proceed.');
        return;
    }

    // Build URL with prefilled data from questionnaire
    const userData = questionnaireState.data;
    const params = new URLSearchParams();

    // Prefill user data if available (field names depend on JotForm setup)
    if (userData.fullName) {
        params.set('name', userData.fullName);
    }
    if (userData.email) {
        params.set('email', userData.email);
    }

    // Add payment type identifier
    params.set('paymentType', paymentType);

    const finalUrl = params.toString()
        ? `${jotformUrl}?${params.toString()}`
        : jotformUrl;

    // Redirect to JotForm
    window.location.href = finalUrl;
}

/* =============================================
   Export state for form handler
   ============================================= */
window.questionnaireState = questionnaireState;
