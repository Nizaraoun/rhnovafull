"""
Main application script for the ATS system.
Usage: python main.py --candidate_id <id> --job_id <id>
"""

import argparse
import logging
import sys
from ats_system import ATSAnalyzer, APIClient


def setup_logging():
    """Setup logging configuration."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('ats_system.log')
        ]
    )


def main():
    """Main application function."""
    parser = argparse.ArgumentParser(
        description='ATS System - Evaluate job application compatibility'
    )
    parser.add_argument(
        '--candidate_id', 
        required=True, 
        help='ID of the candidate to evaluate'
    )
    parser.add_argument(
        '--job_id', 
        required=True, 
        help='ID of the job offer to evaluate against'
    )
    parser.add_argument(
        '--api_base_url', 
        default='http://localhost:8080/api',
        help='Base URL for the API endpoints'
    )
    parser.add_argument(
        '--verbose', 
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    # Setup logging
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    setup_logging()
    
    logger = logging.getLogger(__name__)
    
    try:
        # Initialize API client and analyzer
        api_client = APIClient(base_url=args.api_base_url)
        analyzer = ATSAnalyzer(api_client=api_client)
        
        logger.info(f"Analyzing compatibility for candidate {args.candidate_id} and job {args.job_id}")
        
        # Perform compatibility analysis
        result = analyzer.analyze_compatibility(args.candidate_id, args.job_id)
        
        # Display results
        print(f"\n=== ATS Compatibility Analysis ===")
        print(f"Candidate ID: {result.candidate_id}")
        print(f"Job Offer ID: {result.job_offer_id}")
        print(f"Compatibility Score: {result.compatibility_score:.2%}")
        print(f"Compatible: {'YES' if result.is_compatible else 'NO'}")
        
        if result.is_compatible:
            print("✅ COMPATIBLE - This candidate meets the job requirements!")
        else:
            print("❌ NOT COMPATIBLE - This candidate does not meet the minimum requirements.")
        
        # Display detailed breakdown if verbose
        if args.verbose and 'scores_breakdown' in result.details:
            print(f"\n=== Detailed Score Breakdown ===")
            for category, score in result.details['scores_breakdown'].items():
                weight = result.details['weights_used'][category]
                weighted_score = score * weight
                print(f"{category.capitalize()}: {score:.2%} (weight: {weight:.1%}) = {weighted_score:.2%}")
        
        # Log result for persistence
        logger.info(f"Analysis complete: Score={result.compatibility_score:.2%}, Compatible={result.is_compatible}")
        
        # Update candidature status via API
        logger.info(f"Updating candidature for candidate {args.candidate_id} and job {args.job_id} with compatibility status: {result.is_compatible}")
        update_success = api_client.update_candidature_status(args.candidate_id, args.job_id, result.is_compatible)
        
        if update_success:
            print(f"✅ Candidature for candidate {args.candidate_id} and job {args.job_id} updated successfully")
        else:
            print(f"⚠️ Warning: Failed to update candidature for candidate {args.candidate_id} and job {args.job_id}")
            logger.warning(f"Failed to update candidature for candidate {args.candidate_id} and job {args.job_id}")
        
        # Exit with appropriate code
        sys.exit(0 if result.is_compatible else 1)
        
    except Exception as e:
        logger.error(f"Error during analysis: {e}")
        print(f"Error: {e}")
        sys.exit(2)


def analyze_compatibility(candidate_id: str, job_offer_id: str, api_base_url: str = None, update_candidature: bool = True) -> dict:
    """
    Convenience function for programmatic use.
    
    Args:
        candidate_id: ID of the candidate
        job_offer_id: ID of the job offer  
        api_base_url: Optional API base URL
        update_candidature: Whether to update candidature status (default: True)
        
    Returns:
        Dictionary with compatibility results
    """
    api_client = APIClient(base_url=api_base_url or 'http://localhost:8080/api')
    analyzer = ATSAnalyzer(api_client=api_client)
    
    result = analyzer.analyze_compatibility(candidate_id, job_offer_id)
    
    # Update candidature status if requested
    update_success = False
    if update_candidature:
        update_success = api_client.update_candidature_status(candidate_id, job_offer_id, result.is_compatible)
    
    return {
        'candidate_id': result.candidate_id,
        'job_offer_id': result.job_offer_id,
        'compatibility_score': result.compatibility_score,
        'is_compatible': result.is_compatible,
        'candidature_updated': update_success,
        'details': result.details
    }


if __name__ == '__main__':
    main()
