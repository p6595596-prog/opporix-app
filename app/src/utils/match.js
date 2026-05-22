export const computeMatchScore = (opp, userProfile) => {
  if (!userProfile) return 75;

  let score = 0, total = 0;
  const { age, education, percentage, category } = userProfile;

  // Only evaluate age if it's a valid number > 0
  if (age && Number(age) > 0 && opp.eligibility.ageMin) {
    total += 30;
    const numAge = Number(age);
    const ageOk = numAge >= opp.eligibility.ageMin &&
      (opp.eligibility.ageMax === 0 || numAge <= opp.eligibility.ageMax);
    if (ageOk) score += 30;
  }
  
  if (education && education.trim() !== '' && opp.eligibility.education?.length) {
    total += 40;
    const edOk = opp.eligibility.education.some(e =>
      e.toLowerCase().includes(education.toLowerCase()) ||
      education.toLowerCase().includes(e.toLowerCase())
    );
    if (edOk) score += 40;
  }
  
  // Only evaluate percentage if it's a valid number > 0
  if (percentage && Number(percentage) > 0 && opp.eligibility.minPercentage) {
    total += 20;
    if (Number(percentage) >= opp.eligibility.minPercentage) score += 20;
  }
  
  if (category && category.trim() !== '' && opp.eligibility.category) {
    total += 10;
    if (opp.eligibility.category.includes('All') || opp.eligibility.category.includes(category)) score += 10;
  }
  
  return total > 0 ? Math.round((score / total) * 100) : 75;
};

export const isGoodMatch = (opp, userProfile) => {
  if (!userProfile) return true;
  
  const numAge = Number(userProfile.age);
  if (numAge > 0 && opp.eligibility.ageMin) {
     if (numAge < opp.eligibility.ageMin) return false;
     if (opp.eligibility.ageMax > 0 && numAge > opp.eligibility.ageMax) return false;
  }

  if (userProfile.category && userProfile.category.trim() !== '' && opp.eligibility.category && !opp.eligibility.category.includes('All')) {
    if (!opp.eligibility.category.includes(userProfile.category)) return false;
  }

  return computeMatchScore(opp, userProfile) > 40;
};
