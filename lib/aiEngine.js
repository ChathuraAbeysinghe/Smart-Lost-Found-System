/**
 * AI Matching Engine
 * Node.js in-process TF-IDF + Cosine Similarity based claim verification
 */

// ========== TF-IDF UTILITIES ==========

/**
 * Tokenize and clean text into words
 */
function tokenize(text) {
    if (!text) return []
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been', 'has', 'have', 'had',
    'this', 'that', 'these', 'those', 'it', 'its', 'my', 'your', 'our', 'their',
    'i', 'me', 'we', 'he', 'she', 'they', 'him', 'her', 'us', 'them', 'what', 'which',
    'who', 'when', 'where', 'how', 'why', 'not', 'no', 'yes', 'all', 'any', 'each',
    'item', 'lost', 'found', 'campus', 'university', 'please', 'very', 'some', 'also'
])

/**
 * Build term frequency map
 */
function termFrequency(tokens) {
    const tf = {}
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1 })
    return tf
}

/**
 * Cosine similarity between two TF maps
 */
function cosineSimilarity(tf1, tf2) {
    const allTerms = new Set([...Object.keys(tf1), ...Object.keys(tf2)])
    let dotProduct = 0
    let mag1 = 0
    let mag2 = 0
    allTerms.forEach(term => {
        const v1 = tf1[term] || 0
        const v2 = tf2[term] || 0
        dotProduct += v1 * v2
        mag1 += v1 * v1
        mag2 += v2 * v2
    })
    if (mag1 === 0 || mag2 === 0) return 0
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2))
}

/**
 * Text similarity between two strings (0-1)
 */
function textSimilarity(text1, text2) {
    const toks1 = tokenize(text1)
    const toks2 = tokenize(text2)
    if (toks1.length === 0 && toks2.length === 0) return 1
    if (toks1.length === 0 || toks2.length === 0) return 0
    const tf1 = termFrequency(toks1)
    const tf2 = termFrequency(toks2)
    return cosineSimilarity(tf1, tf2)
}

/**
 * Keyword overlap score (Jaccard similarity)
 */
function keywordSimilarity(kws1 = [], kws2 = []) {
    if (kws1.length === 0 && kws2.length === 0) return 0.5
    const set1 = new Set(kws1.map(k => k.toLowerCase()))
    const set2 = new Set(kws2.map(k => k.toLowerCase()))
    const intersection = [...set1].filter(x => set2.has(x)).length
    const union = new Set([...set1, ...set2]).size
    return union === 0 ? 0 : intersection / union
}

/**
 * Date proximity score (daysApart → 0-1)
 * Same day = 1.0, 1 week = 0.8, 1 month = 0.4, 3+ months = 0
 */
function dateSimilarity(date1, date2) {
    if (!date1 || !date2) return 0.5
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24))
    if (diffDays <= 1) return 1.0
    if (diffDays <= 7) return 0.85
    if (diffDays <= 14) return 0.7
    if (diffDays <= 30) return 0.5
    if (diffDays <= 60) return 0.3
    if (diffDays <= 90) return 0.1
    return 0
}

/**
 * Location similarity (text + keyword overlap)
 */
function locationSimilarity(loc1, loc2) {
    if (!loc1 || !loc2) return 0.3
    return textSimilarity(loc1, loc2)
}

/**
 * Category exact match
 */
function categorySimilarity(cat1, cat2) {
    if (!cat1 || !cat2) return 0
    return cat1.toLowerCase() === cat2.toLowerCase() ? 1 : 0
}

/**
 * Color + brand exact match boost
 */
function attributeSimilarity(item1, item2) {
    let score = 0
    let count = 0

    if (item1.color && item2.color) {
        count++
        if (item1.color.toLowerCase() === item2.color.toLowerCase()) score++
    }
    if (item1.brand && item2.brand) {
        count++
        score += textSimilarity(item1.brand, item2.brand)
    }
    return count === 0 ? 0.5 : score / count
}

// ========== RISK DETECTION ==========

/**
 * Risk scoring - detects suspicious claim patterns
 */
function computeRiskScore(lostItem, foundItem, claim) {
    let risk = 0

    // Vague ownership explanation
    const explanationLength = (claim?.ownershipExplanation || '').trim().length
    if (explanationLength < 30) risk += 25
    else if (explanationLength < 80) risk += 10

    // No hidden details provided
    if (!(claim?.hiddenDetails || '').trim()) risk += 15

    // Date mismatch > 30 days
    const dateDiff = Math.abs(
        new Date(lostItem.dateLost || Date.now()) - new Date(foundItem.dateFound || Date.now())
    ) / (1000 * 60 * 60 * 24)
    if (dateDiff > 30) risk += 20
    else if (dateDiff > 14) risk += 10

    // Category mismatch
    if (lostItem.category !== foundItem.category) risk += 20

    return Math.min(100, risk)
}

// ========== MAIN ENGINE ==========

/**
 * Compute match score between a lost item and found item (+ claim details).
 * Returns: { matchScore, riskScore, suggestedDecision, breakdown }
 */
export function computeMatchScore(lostItem, foundItem, claim = {}) {
    // Weights for each component
    const W = {
        description: 0.30,
        keywords: 0.20,
        location: 0.15,
        date: 0.20,
        category: 0.10,
        attributes: 0.05,
    }

    const descScore = textSimilarity(
        `${lostItem.title} ${lostItem.description}`,
        `${foundItem.title} ${foundItem.description}`
    )

    const kwScore = keywordSimilarity(lostItem.keywords, foundItem.keywords)

    const locScore = locationSimilarity(lostItem.possibleLocation, foundItem.locationFound)

    const dateScore = dateSimilarity(lostItem.dateLost, foundItem.dateFound)

    const catScore = categorySimilarity(lostItem.category, foundItem.category)

    const attrScore = attributeSimilarity(lostItem, foundItem)

    const rawMatch =
        descScore * W.description +
        kwScore * W.keywords +
        locScore * W.location +
        dateScore * W.date +
        catScore * W.category +
        attrScore * W.attributes

    const matchScore = Math.round(rawMatch * 100)
    const riskScore = computeRiskScore(lostItem, foundItem, claim)

    // Adjusted effective score (risk penalises)
    const effectiveScore = Math.max(0, matchScore - (riskScore * 0.2))

    let suggestedDecision
    if (effectiveScore >= 70) suggestedDecision = 'approve'
    else if (effectiveScore >= 40) suggestedDecision = 'review'
    else suggestedDecision = 'reject'

    return {
        matchScore,
        riskScore,
        suggestedDecision,
        breakdown: {
            descriptionScore: Math.round(descScore * 100),
            keywordScore: Math.round(kwScore * 100),
            locationScore: Math.round(locScore * 100),
            dateScore: Math.round(dateScore * 100),
            categoryScore: Math.round(catScore * 100),
        },
    }
}
