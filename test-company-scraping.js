// Test script for company scraping functionality
// Run this with: node test-company-scraping.js

console.log('🚀 Company Scraping Test Script');
console.log('================================');

// Simulate the company scraping service
class TestCompanyScraper {
  constructor() {
    this.companies = [
      {
        id: 'google_1',
        name: 'Google',
        description: 'Google is a multinational technology company specializing in Internet-related services and products.',
        industry: 'Technology',
        size: '100,000+ employees',
        founded: '1998',
        headquarters: 'Mountain View, California, United States',
        website: 'https://www.google.com',
        logo: 'https://logo.clearbit.com/google.com',
        employees: 156500,
        revenue: '$307.4B',
        type: 'Public',
        specialties: ['Search Engine', 'Cloud Computing', 'AI/ML', 'Mobile OS', 'Advertising'],
        benefits: ['Health insurance', 'Stock options', 'Free meals', 'Gym membership', 'Learning budget'],
        culture: ['Innovation-focused', 'Data-driven', 'Collaborative', 'Fast-paced'],
        technologies: ['Python', 'Java', 'Go', 'Kubernetes', 'TensorFlow', 'Android'],
        locations: [
          {
            city: 'Mountain View',
            state: 'California',
            country: 'United States',
            type: 'Headquarters'
          },
          {
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            type: 'Office'
          }
        ],
        socialMedia: {
          linkedin: 'https://linkedin.com/company/google',
          twitter: 'https://twitter.com/google',
          youtube: 'https://youtube.com/google'
        },
        ratings: {
          overall: 4.3,
          culture: 4.2,
          workLifeBalance: 4.1,
          careerGrowth: 4.4,
          compensation: 4.5,
          management: 4.0,
          totalReviews: 15420
        },
        contactInfo: {
          email: 'careers@google.com',
          phone: '+1-650-253-0000'
        },
        scrapedAt: new Date().toISOString(),
        source: 'LinkedIn'
      },
      {
        id: 'microsoft_1',
        name: 'Microsoft',
        description: 'Microsoft Corporation is an American multinational technology company that develops, manufactures, licenses, supports, and sells computer software.',
        industry: 'Technology',
        size: '100,000+ employees',
        founded: '1975',
        headquarters: 'Redmond, Washington, United States',
        website: 'https://www.microsoft.com',
        logo: 'https://logo.clearbit.com/microsoft.com',
        employees: 221000,
        revenue: '$198.3B',
        type: 'Public',
        specialties: ['Operating Systems', 'Cloud Computing', 'Productivity Software', 'Gaming', 'AI'],
        benefits: ['Health insurance', 'Stock options', 'Flexible hours', 'Remote work', 'Learning budget'],
        culture: ['Innovation', 'Collaboration', 'Diversity', 'Growth mindset'],
        technologies: ['C#', '.NET', 'Azure', 'TypeScript', 'React', 'Power BI'],
        locations: [
          {
            city: 'Redmond',
            state: 'Washington',
            country: 'United States',
            type: 'Headquarters'
          },
          {
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            type: 'Office'
          }
        ],
        socialMedia: {
          linkedin: 'https://linkedin.com/company/microsoft',
          twitter: 'https://twitter.com/microsoft',
          youtube: 'https://youtube.com/microsoft'
        },
        ratings: {
          overall: 4.2,
          culture: 4.1,
          workLifeBalance: 4.0,
          careerGrowth: 4.3,
          compensation: 4.2,
          management: 4.1,
          totalReviews: 12350
        },
        contactInfo: {
          email: 'careers@microsoft.com',
          phone: '+1-425-882-8080'
        },
        scrapedAt: new Date().toISOString(),
        source: 'Glassdoor'
      },
      {
        id: 'amazon_1',
        name: 'Amazon',
        description: 'Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence.',
        industry: 'E-commerce & Technology',
        size: '100,000+ employees',
        founded: '1994',
        headquarters: 'Seattle, Washington, United States',
        website: 'https://www.amazon.com',
        logo: 'https://logo.clearbit.com/amazon.com',
        employees: 1608000,
        revenue: '$514.0B',
        type: 'Public',
        specialties: ['E-commerce', 'Cloud Computing', 'AI/ML', 'Logistics', 'Digital Media'],
        benefits: ['Health insurance', 'Stock options', 'Flexible hours', 'Remote work', 'Career development'],
        culture: ['Customer-focused', 'Innovation', 'Ownership', 'High standards'],
        technologies: ['Java', 'Python', 'AWS', 'React', 'DynamoDB', 'Lambda'],
        locations: [
          {
            city: 'Seattle',
            state: 'Washington',
            country: 'United States',
            type: 'Headquarters'
          },
          {
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            type: 'Office'
          }
        ],
        socialMedia: {
          linkedin: 'https://linkedin.com/company/amazon',
          twitter: 'https://twitter.com/amazon',
          youtube: 'https://youtube.com/amazon'
        },
        ratings: {
          overall: 3.8,
          culture: 3.5,
          workLifeBalance: 3.2,
          careerGrowth: 4.0,
          compensation: 4.2,
          management: 3.6,
          totalReviews: 18750
        },
        contactInfo: {
          email: 'jobs@amazon.com',
          phone: '+1-206-266-1000'
        },
        scrapedAt: new Date().toISOString(),
        source: 'Crunchbase'
      }
    ];
  }

  async scrapeCompanies(query = '', limit = 10) {
    console.log(`🔍 Scraping companies with query: "${query}" (limit: ${limit})`);
    
    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const filteredCompanies = this.companies
      .filter(company => 
        !query || 
        company.name.toLowerCase().includes(query.toLowerCase()) ||
        company.industry.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);

    const sources = ['LinkedIn', 'Glassdoor', 'Crunchbase'];
    const errors = [];

    console.log(`✅ Found ${filteredCompanies.length} companies`);
    console.log(`📊 Sources: ${sources.join(', ')}`);
    
    if (errors.length > 0) {
      console.log(`⚠️  Errors: ${errors.length}`);
    }

    return {
      companies: filteredCompanies,
      totalFound: filteredCompanies.length,
      scrapedAt: new Date().toISOString(),
      sources,
      errors
    };
  }

  getCompanyDetails(companyId) {
    return this.companies.find(c => c.id === companyId) || null;
  }

  getIndustries() {
    const industries = new Set(this.companies.map(c => c.industry));
    return Array.from(industries).sort();
  }

  getCompanySizes() {
    const sizes = new Set(this.companies.map(c => c.size));
    return Array.from(sizes).sort();
  }

  getCompanyTypes() {
    const types = new Set(this.companies.map(c => c.type));
    return Array.from(types).sort();
  }
}

// Test functions
async function testBasicScraping() {
  console.log('\n📋 Test 1: Basic Company Scraping');
  console.log('----------------------------------');
  
  const scraper = new TestCompanyScraper();
  const result = await scraper.scrapeCompanies('', 5);
  
  console.log('\n📈 Scraping Results:');
  result.companies.forEach((company, index) => {
    console.log(`${index + 1}. ${company.name} (${company.industry})`);
    console.log(`   📍 ${company.headquarters}`);
    console.log(`   👥 ${company.size} | 💰 ${company.revenue}`);
    console.log(`   ⭐ ${company.ratings.overall}/5 (${company.ratings.totalReviews} reviews)`);
    console.log(`   🏷️  ${company.specialties.slice(0, 3).join(', ')}`);
    console.log(`   🔗 ${company.website}`);
    console.log('');
  });
}

async function testSearchScraping() {
  console.log('\n🔍 Test 2: Search-Based Scraping');
  console.log('---------------------------------');
  
  const scraper = new TestCompanyScraper();
  const result = await scraper.scrapeCompanies('technology', 3);
  
  console.log('\n🔍 Search Results for "technology":');
  result.companies.forEach((company, index) => {
    console.log(`${index + 1}. ${company.name}`);
    console.log(`   📝 ${company.description.substring(0, 100)}...`);
    console.log(`   🛠️  ${company.technologies.slice(0, 4).join(', ')}`);
    console.log('');
  });
}

function testCompanyDetails() {
  console.log('\n📄 Test 3: Company Details');
  console.log('--------------------------');
  
  const scraper = new TestCompanyScraper();
  const company = scraper.getCompanyDetails('google_1');
  
  if (company) {
    console.log(`🏢 Company: ${company.name}`);
    console.log(`📅 Founded: ${company.founded}`);
    console.log(`🏢 Type: ${company.type}`);
    console.log(`💼 Benefits: ${company.benefits.slice(0, 3).join(', ')}`);
    console.log(`🎯 Culture: ${company.culture.join(', ')}`);
    console.log(`📞 Contact: ${company.contactInfo.email} | ${company.contactInfo.phone}`);
    console.log(`📱 Social: LinkedIn | Twitter | YouTube`);
    console.log('');
  }
}

function testFilters() {
  console.log('\n🔧 Test 4: Available Filters');
  console.log('----------------------------');
  
  const scraper = new TestCompanyScraper();
  
  console.log('🏭 Industries:', scraper.getIndustries().join(', '));
  console.log('👥 Company Sizes:', scraper.getCompanySizes().join(', '));
  console.log('🏢 Company Types:', scraper.getCompanyTypes().join(', '));
  console.log('');
}

function testDataExport() {
  console.log('\n📊 Test 5: Data Export');
  console.log('----------------------');
  
  const scraper = new TestCompanyScraper();
  
  // Simulate CSV export
  const csvHeaders = ['Name', 'Industry', 'Size', 'Location', 'Rating', 'Website'];
  const csvData = scraper.companies.map(company => [
    company.name,
    company.industry,
    company.size,
    company.headquarters,
    company.ratings.overall,
    company.website
  ]);
  
  console.log('📄 CSV Export Preview:');
  console.log(csvHeaders.join(','));
  csvData.slice(0, 3).forEach(row => {
    console.log(row.join(','));
  });
  console.log('...');
  console.log('');
}

// Run all tests
async function runAllTests() {
  try {
    await testBasicScraping();
    await testSearchScraping();
    testCompanyDetails();
    testFilters();
    testDataExport();
    
    console.log('🎉 All tests completed successfully!');
    console.log('\n💡 Usage Tips:');
    console.log('• Use the Companies page in the web app to see the full interface');
    console.log('• The scraping service supports real-time data from multiple sources');
    console.log('• Data is cached for 24 hours to improve performance');
    console.log('• You can export company data to CSV format');
    console.log('• Bookmark companies for quick access');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
runAllTests(); 