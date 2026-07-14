def calculate_trust_score(result):

    score = 100

    if not result["asset_detected"]:
        score -= 50

    fraud = result["fraud_indicators"]

    if fraud["wrong_location"]:
        score -= 20

    if fraud["vegetation_unchanged"]:
        score -= 15

    if fraud["missing_construction"]:
        score -= 30

    if fraud["possible_fake_claim"]:
        score -= 20

    return max(score, 0)