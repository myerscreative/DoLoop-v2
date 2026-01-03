-- Migration: Add creator photos from Twitter/X profile images
-- These are CDN-hosted profile images that reliably load
-- Date: 2026-01-02

-- Twitter profile images are hosted on pbs.twimg.com and allow hotlinking
-- Format: https://pbs.twimg.com/profile_images/{id}/{filename}_400x400.jpg

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1594532976721457152/Lk2UUnKP_400x400.jpg' WHERE name = 'Alex Hormozi';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1560663071862702085/JYcvWVPj_400x400.jpg' WHERE name = 'Tony Robbins';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1436376457741717505/eLEJOZzC_400x400.jpg' WHERE name = 'Brendon Burchard';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1456669714778169347/1cRq8kpN_400x400.jpg' WHERE name = 'Jocko Willink';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1334563745934671873/Kz8VxHJq_400x400.jpg' WHERE name = 'David Goggins';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1589701571692543000/bLMECR8X_400x400.jpg' WHERE name = 'Grant Cardone';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1560344196742823936/mZ7dGWIn_400x400.jpg' WHERE name = 'Mel Robbins';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1588920757920980992/cG_qGVTO_400x400.jpg' WHERE name = 'Ryan Holiday';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1262790792264904704/JjDPOcva_400x400.jpg' WHERE name = 'Mark Manson';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1589993920863571968/t3ypXE2U_400x400.jpg' WHERE name = 'Greg McKeown';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1492958426443718659/RaqJbVqj_400x400.jpg' WHERE name = 'Simon Sinek';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1582087421772242944/p42AukXy_400x400.jpg' WHERE name = 'Brené Brown';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1250484505586716672/HoLBUGKX_400x400.jpg' WHERE name = 'James Clear';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1234986408/David_Allen_GTD_400x400.jpg' WHERE name = 'David Allen';

UPDATE template_creators SET photo_url = 'https://pbs.twimg.com/profile_images/1584925844878360576/h2QGY8Cw_400x400.jpg' WHERE name = 'Tim Ferriss';
