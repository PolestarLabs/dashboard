
// const DB = require('../database')
const express = require('express')
const route = express.Router()
const axios = require('axios')

route.get(['/t'], (req,res)=>{
    res.send(`<html>
    <body>
    <div id="oembed-wrapper-bb3934c1efcdfcfb0004109179ef438e"
         class="riot-news-widget riot-news-widget-latest-patch-notes riot-news-widget-i18n-en"
         data-ping-meta="uuid=a1766404-9487-4b39-a401-2c25d246e7b2|title=Patch 6.10 notes|author=Scarizard|realm=na|language=en|publish_date=2016-05-17T18:04:37.794Z|category=game_updates:patch|tuuid=a1766404-9487-4b39-a401-2c25d246e7b2|type=article|redirect=|tags=patch_notes|content-opens=client">
        <div class="riot-news-widget-toc">
            <div class="node-full">
                <div class="gs-container">
                    <div class="default-2-3 hidden"><h1 class="riot-news-widget-toc-title riot-news-widget-i18n-en">Table of
                        Contents</h1></div>
                    <div class="default-1-3"></div>
                </div>
            </div>
        </div>
        <div class="riot-news-widget-latest-patch-notes-content" id="oembed-a1766404-9487-4b39-a401-2c25d246e7b2"><input
                type="hidden" class="riot-news-widget-card-title" value="Patch 6.10 notes"/>
    
            <h1 class="riot-news-widget-title riot-news-widget-i18n-en">Patch 6.10 notes</h1>
    
            <div class="riot-news-widget-body">
                <div id="patch-notes-container"><p style="text-align:center;font-size:1.2em;"><em>Got patching
                    problems? <a
                            href="http://boards.na.leagueoflegends.com/en/c/help-support/ysTVIauY-new-having-issues-patching-610-click-here;"
                            target="_blank">Check the Boards</a> for tips and solutions!</em></p><h2
                        id="patch-top"></h2>
                    <blockquote class="blockquote context">Greetings, summoners.<br/><br/>Welcome to patch 6.10,
                        the one <em>after</em> Midseason. We’re back to business as usual in terms of our layout this time.
                        6.9’s template is one we break out for special occasions, and ‘changing almost everything in League’
                        seemed to fit that description.<br/><br/>Just as with <em>any</em> patch after a major update,
                        6.10’s mostly about reacting to whatever balance outliers remain after the tectonic shift. You can’t
                        make an omelette without breaking a few eggs - or in this case, a few mages. While we’re waiting for
                        the dust to settle and the rest of the game’s landscape to really take shape, it’s clear that a few
                        of our mage updates undershot (or overshot) expectations.<br/><br/>While mages make up the
                        bulk of 6.10’s tuning, reacting to other systemic shifts in the ecosystem (Bloodrazor, Ocean Drake)
                        is still a top priority. Beyond that however, this 6.10 is pretty narrow in scope as we continue to
                        evaluate how players are adapting to Midseason. There’s lots left to discover and play around still
                        flying under the radar, so expect more focus as those builds and pocket picks shake out. Apparently
                        people are succeeding with Skirmisher’s Sabre Bloodrazor bot lane Kog’Maw. If that’s not enough to
                        get you experimenting, nothing will.<br/><br/>We’ve also got some matchmaking fixes coming in
                        later this patch aimed at reining in queue times and making more even matches at the top of the
                        ladder. We’ll hit you up when the changes are good to go, so keep an eye on the front
                        page.<br/><br/>That’s all for us this patch! Check out the rest of the notes to find out
                        exactly who’s changing and how, and we’ll see you on the rift looking for the next big thing.
                        Shout-outs to the 5 Singed mains out there - these Ghost buffs are on the house.<br/><br/>GL,
                        HF.
                    </blockquote>
                    <p><span class="context-designer"><img
                            src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/avatars/ScarizardIcon_thumb.jpg"/> Patrick "Scarizard" Scarborough</span>
                    </p><p><a href="#patch-top" class="btt">Back to top</a></p>
                    <header class="header-primary"><h2 id="patch-updates">Patch Updates</h2></header>
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"><img
                                    src="https://am-a.akamaihd.net/image?f=https://news-a.akamaihd.net/public/images/articles/2016/may/pn610/Taliyah_Square_0.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-taliyah-balance-changes">Taliyah Balance
                                    Changes</h3><p class="summary">Q mana cost and Worked
                                    Ground duration reduced.</p>
                                <blockquote class="blockquote context">Taliyah is struggling to find early-game
                                    success. We're easing up on Threaded Volley's restrictions, giving Taliyah more
                                    opportunities to secure lane victories she can translate into mid-game power.<br/><br/>Quick
                                    note: since this is a mid-patch change, Taliyah's tooltips won't be updated until
                                    6.11.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.10.1/img/spell/TaliyahQ.png&resize=32:"/>Q
                                    - Threaded Volley</h4>
                                <div class="attribute-change"><span class="attribute">COST</span> <span
                                        class="attribute-before">60/65/70/75/80 mana</span> <span
                                        class="change-indicator">⇒</span> <span
                                        class="attribute-after">50/55/60/65/70 mana</span>
                                </div>
                                
                                <div class="attribute-change"><span
                                        class="attribute">WORKED GROUND DURATION</span> <span class="attribute-before">180 seconds</span>
                                    <span class="change-indicator">⇒</span> <span class="attribute-after">140 seconds</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="white-stone accent-before">
                            <div><h3 class="change-title" id="patch-5/19/2016">5/19/2016</h3>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Sona.png&resize=32:"/>Sona
                                </h4>
                                <div class="attribute-change"><span class="attribute">WHO LET YOU OFF PBE</span>
                                    <span class="attribute-after">Reverted a few experimental changes to <strong>E - Song of
                                        Celerity</strong> which weren't intended for the patch</span>
                                </div>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Urgot.png&resize=32:"/>Urgot
                                </h4>
                                <div class="attribute-change"><span class="attribute">OVERLY TERRIFIED</span>
                                    <span class="attribute-after">Fixed a bug where <strong>R - Hyper-Kinetic Position
                                        Reverser</strong>'s terrify duration was sometimes lasting longer than intended</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <header class="header-primary"><h2 id="patch-champions">Champions</h2></header>
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"><img
                                    src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Taliyah_Square_0.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-taliyah">Taliyah</h3>
                                <blockquote class="blockquote context">Taliyah, the Stone Weaver, will be
                                    released in this patch! To learn more, check the following links:
                                </blockquote>
                                
                                <ul>
                                    <li><a
                                            href="http://na.leagueoflegends.com/en/featured/taliyah-short-story">The Bird
                                        and the Branch</a>
                                    </li>
                                    
                                    <li><a href="https://www.youtube.com/watch?v=H1nRIX-qvbo">Homecoming</a>
                                    </li>
                                    
                                    <li><a
                                            href="http://na.leagueoflegends.com/en/page/champion-reveal-taliyah-stoneweaver">Champion
                                        Reveal</a>
                                    </li>
                                    
                                    <li><a
                                            href="http://na.leagueoflegends.com/en/news/champions-skins/champion-preview/champion-insights-taliyah-stoneweaver">Champion
                                        Insights</a>
                                    </li>
                                    
                                    <li><a
                                            href="http://na.leagueoflegends.com/en/news/community/community-spotlight/inside-taliyah-dev-designers">Inside
                                        Taliyah dev with the designers</a>
                                    </li>
                                    
                                    <li><a
                                            href="http://boards.na.leagueoflegends.com/en/c/gameplay-balance/Q5Rti3k0">Taliyah
                                        Q&A</a>
                                    </li>
                                    
                                    <li><a href="https://www.youtube.com/watch?v=3-XQ0Jb2MRs">Champion
                                        Spotlight</a>
                                    </li>
                                    
                                </ul>
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/alistar/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Alistar.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-alistar"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/alistar/">Alistar</a>
                                </h3><p class="summary">R damage reduction down.</p>
                                
                                <blockquote class="blockquote context">Alistar's the definition of a
                                    professional staple, bringing consistent peel, initiation, and diving potential. We're
                                    not looking to change that, but when Alistar becomes <em>too</em> reliable he suffocates
                                    the rest of the support landscape. We've always been happy with Alistar breaking up the
                                    attrition of an all-ranged lane through the threat of tower-dives, but at present he's
                                    got too much of a good thing. We're toning back Ali's early-game ability to tank turret
                                    shots (and everything else) so opponents have a chance to play around his window of
                                    strength rather than just flee for its duration.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/FerociousHowl.png&resize=32:"/>R
                                    - Unbreakable Will</h4>
                                <div class="attribute-change"><span class="attribute">DAMAGE REDUCTION</span>
                                    <span class="attribute-before">70% at all ranks</span> <span
                                            class="change-indicator">⇒</span> <span class="attribute-after">50/60/70%</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/anivia/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Anivia.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-anivia"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/anivia/">Anivia</a>
                                </h3><p class="summary">R radius and cast range increased. Mana cost
                                    down.</p>
                                <blockquote class="blockquote context">The first of many follow-ups to our
                                    Midseason mage updates, we begin with Anivia. While we’re confident in the controlling
                                    shift we made with the Cryophoenix in 6.9, Anivia as a whole ended up less reliable in
                                    the process. With a heavier focus placed on Glacial Storm’s uptime, we’re making it
                                    easier for her to maintain her signature zoning tool.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/GlacialStorm.png&resize=32:"/>R
                                    - Glacial Storm</h4>
                                <div class="attribute-change"><span class="attribute">COST PER SECOND</span>
                                    <span class="attribute-before">40/50/60 mana</span> <span
                                            class="change-indicator">⇒</span> <span
                                            class="attribute-after">30/40/50 mana</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">CAST RANGE</span> <span
                                        class="attribute-before">685</span> <span class="change-indicator">⇒</span> <span
                                        class="attribute-after">750</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">INITIAL RADIUS</span>
                                    <span class="attribute-before">150</span> <span class="change-indicator">⇒</span> <span
                                            class="attribute-after">200</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">SWAGSTORM</span> <span
                                        class="attribute-after">Using Zhonya’s Hourglass no longer interrupts Glacial Storm</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/aurelionsol/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/AurelionSol.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-aurelionsol"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/aurelionsol/">Aurelion
                                    Sol</a></h3><p class="summary">W cooldown up. R damage
                                    down.</p>
                                <blockquote class="blockquote context">While our last changes pulled him down
                                    from the heavens, Aurelion Sol’s still kicking as our biggest over-performer. Alas, when
                                    you’re a strong laner with amazing roaming and teamfighting - something’s gotta give.
                                    For this update, we’re focusing on hitting Sol’s in-fight reliability. As-is, Aurelion
                                    holds all the cards in any given engagement due to his Celestial Expansion’s amazing
                                    flexibility, forcing opponents to march to his beat. Putting some of the counterplay
                                    back into whether or not Aurelion can safely avoid being knocked out of his empowered
                                    state, as well as draining some his raw damage output, should see the Starforger less
                                    powerful (but no less magnificent).
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/AurelionSolW.png&resize=32:"/>W
                                    - Celestial Expansion</h4>
                                <div class="attribute-change"><span class="attribute">COOLDOWN</span> <span
                                        class="attribute-before">6/5/4/3/2 seconds</span> <span
                                        class="change-indicator">⇒</span> <span class="attribute-after">6/5.5/5/4.5/4 seconds</span>
                                </div>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/AurelionSolR.png&resize=32:"/>R
                                    - Voice of Light</h4>
                                <div class="attribute-change"><span class="attribute">DAMAGE</span> <span
                                        class="attribute-before">200/300/400</span> <span class="change-indicator">⇒</span>
                                    <span class="attribute-after">150/250/350</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/cassiopeia/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Cassiopeia.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-cassiopeia"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/cassiopeia/">Cassiopeia</a>
                                </h3><p class="summary">Q and W ranges up. W cooldown
                                    decreased.</p>
                                <blockquote class="blockquote context">One of the larger Midseason mage updates,
                                    Cassiopeia’s strengths as an immobilizing controller have been muted by a rather weak
                                    release state. Low ranges across her poisons appear to be the culprit, as Cassi quite
                                    literally lives or dies on her ability to access Noxious Blast’s burst of speed (or
                                    Miasma’s grounding). Add in some bonus usability to her poisons and Cassiopeia will see
                                    herself actually able to play her keep-away kite game without being overrun.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/CassiopeiaQ.png&resize=32:"/>Q
                                    - Noxious Blast</h4>
                                <div class="attribute-change"><span class="attribute">RANGE</span> <span
                                        class="attribute-before">750</span> <span class="change-indicator">⇒</span> <span
                                        class="attribute-after">850</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">SAVOR THE MOMENT</span>
                                    <span class="attribute-after">Noxious Blast’s movement speed bonus takes longer to decay</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">POISONOUS CLARITY</span>
                                    <span class="attribute-after">“Poisoned” particle’s size has been increased</span>
                                </div>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/CassiopeiaW.png&resize=32:"/>W
                                    - Miasma</h4>
                                <div class="attribute-change"><span class="attribute">COOLDOWN</span> <span
                                        class="attribute-before">22/20/18/16/14 seconds</span> <span
                                        class="change-indicator">⇒</span> <span class="attribute-after">18/17/16/15/14 seconds</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">MINIMUM RANGE</span> <span
                                        class="attribute-before">550</span> <span class="change-indicator">⇒</span> <span
                                        class="attribute-after">500</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">MAXIMUM RANGE</span> <span
                                        class="attribute-before">800</span> <span class="change-indicator">⇒</span> <span
                                        class="attribute-after">900</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">BRINGING IT BACK</span>
                                    <span class="attribute-after">No longer stops upon hitting terrain</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/fiddlesticks/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/FiddleSticks.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-fiddlesticks"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/fiddlesticks/">Fiddlesticks</a>
                                </h3><p class="summary">E bounces down. More scarecrow.</p>
                                
                                <blockquote class="blockquote context">After a season in the shadows,
                                    Fiddlesticks is back with a vengeance following his spooky update. This patch is nothing
                                    complicated - we’re going to keep our eye as Fiddle continues to harbinge doom all over
                                    the place, but the clearing and dueling potential from Dark Wind was simply too
                                    high.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title">General</h4>
                                <div class="attribute-change"><span class="attribute"><span
                                        class="new">new</span>SPOOKY</span> <span class="attribute-after">After 5 seconds of not moving, Fiddlesticks will become a scarecrow</span>
                                </div>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/FiddlesticksDarkWind.png&resize=32:"/>E
                                    - Dark Wind</h4>
                                <div class="attribute-change"><span class="attribute">NUMBER OF BOUNCES</span>
                                    <span class="attribute-before">7</span> <span class="change-indicator">⇒</span> <span
                                            class="attribute-after">6</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/fizz/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Fizz.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-fizz"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/fizz/">Fizz</a>
                                </h3><p class="summary">R’s fish can’t be cleansed.</p>
                                
                                <blockquote class="blockquote context">Due to the changes to Quicksilver Sash
                                    only removing crowd control, a nasty bug surfaced where <strong>any</strong> ability
                                    that cleansed slows (like Garen’s <strong>Q - Decisive Strike</strong>) would completely
                                    detach Fizz’s shark from the target. Rather than just reverting it to its previous
                                    behaviour, we’re instead making it consistent with QSS’s debuff interaction. Cleansing
                                    the slow will allow you to move at full speed, but won’t detach the shark. Like with
                                    QSS’s interactions with other high-profile abilities (ex. Zed’s <strong>R - Death
                                        Mark</strong> and Fiora’s <strong>R - Grand Challenge</strong>), we’ll be closely
                                    monitoring how these changes affect Fizz’s performance.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/FizzMarinerDoom.png&resize=32:"/>R
                                    - Chum the Waters</h4>
                                <div class="attribute-change"><span class="attribute"><span class="removed">removed</span>SHARKBAIT</span>
                                    <span class="attribute-removed">Cleansing Chum the Waters’ slow no longer detaches the shark from the target.</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/illaoi/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Illaoi.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-illaoi"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/illaoi/">Illaoi</a>
                                </h3><p class="summary">W cooldown down.</p>
                                <blockquote class="blockquote context">Following changes to her Test of Spirit,
                                    Illaoi’s found her performance a little lopsided this patch. Traditionally relying on a
                                    powerful laning phase to transition into strong teamfighting, Illaoi’s new vessel
                                    mechanics have reversed this dynamic. Now, Illaoi’s late-game vessel shenanigans are
                                    making a big splash, but it’s her early-game strength that’s been reduced significantly.
                                    We’re happy with the direction of the new Test of Spirit (i.e. providing a tangible
                                    benefit to Illaoi but not debuffing opponents for a million years), so we’re giving the
                                    Kraken Priestess a booster-shot to her early lane-bully potential to even things
                                    out.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/IllaoiW.png&resize=32:"/>W
                                    - Harsh Lesson</h4>
                                <div class="attribute-change"><span class="attribute">COOLDOWN</span> <span
                                        class="attribute-before">6/5.5/5/4.5/4 seconds</span> <span
                                        class="change-indicator">⇒</span> <span class="attribute-after">4 seconds</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/jinx/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Jinx.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-jinx"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/jinx/">Jinx</a>
                                </h3><p class="summary">Rocket attacks faster at level 1, but scales
                                    worse with attack speed.</p>
                                <blockquote class="blockquote context">Our last round of changes to Switcheroo
                                    were targeted at differentiating Jinx’s weapons to make it clear when each should be
                                    useful. Pow-Pow’s minigun is for hyper-carry damage output at short range, while
                                    Fishbones’ rocket launcher is for poking and area damage at the cost of a significant
                                    amount of DPS uptime. We’re happy with how that’s played out, save one unintended goal:
                                    the usability of Jinxs’ level 1 rockets suffered immensely. Seeing how our previous
                                    change was about making rockets scale worse with items, we’re improving the feel and
                                    flow of Jinx’s trusty Fishbones for all of her destructive lane-bullying
                                    needs.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/JinxQ.png&resize=32:"/>Q
                                    - Switcheroo!</h4>
                                <div class="attribute-change"><span class="attribute">FISHBONES BASE ATTACK SPEED</span>
                                    <span class="attribute-before">0.531</span> <span class="change-indicator">⇒</span>
                                    <span class="attribute-after">0.625</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">FISHBONES ATTACK SPEED PENALTY</span>
                                    <span class="attribute-before">15% reduced bonus attack speed</span> <span
                                            class="change-indicator">⇒</span> <span class="attribute-after">25% reduced bonus attack speed</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/malzahar/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Malzahar.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-malzahar"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/malzahar/">Malzahar</a>
                                </h3><p class="summary">Passive cooldown up.</p>
                                <blockquote class="blockquote context">While our balance hotfix looks to have
                                    solved much of Malzahar’s over-the-top performance (like soloing dragons at level 3),
                                    Malzahar’s still ahead of the pack when it comes to mage dominance on 6.9. Void Shift is
                                    an important tool to facilitate Malzahar wading through the midlines to lockdown a
                                    priority target, but the cooldown is so flexible during laning that it makes most
                                    aggression feel meaningless. We’re dramatically increasing the windows opponents have to
                                    pull Malzahar out of the void and back to his fountain (especially early
                                    game).
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/passive/Malzahar_Passive.png&resize=32:"/>Passive
                                    - Void Shift</h4>
                                <div class="attribute-change"><span class="attribute">COOLDOWN</span> <span
                                        class="attribute-before">23-6 seconds (at levels 1-18)</span> <span
                                        class="change-indicator">⇒</span> <span class="attribute-after">30/18/10/6 seconds (at levels 1/6/11/16)</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">VOID CLARITY</span> <span
                                        class="attribute-after">Cooldown indicator is now also shown on buff bar</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/masteryi/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/MasterYi.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-masteryi"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/masteryi/">Master
                                    Yi</a></h3><p class="summary">W ratio up. E damage
                                    up.</p>
                                <blockquote class="blockquote context">Master Yi’s been on a bit of a wild ride
                                    when it comes to the patch notes, but now we find the Wuju Bladesman pretty far behind
                                    the curve. Specifically, changes to Guinsoo’s Rageblade and the removal of Sated
                                    Devourer’s got Yi feeling pretty confused about how he should be building in a
                                    post-midseason world. With Sated’s magic proc gone (and Bloodrazor’s damage being
                                    entirely physical), armor’s better protection against Master Yi than it’s ever been.
                                    Coupled with some changes to the new enchantment, tossing some power back in Yeezy’s
                                    true damage will help him melt through sturdier targets when he can’t reach the back
                                    line.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/Meditate.png&resize=32:"/>W
                                    - Meditate</h4>
                                <div class="attribute-change"><span class="attribute">RATIO</span> <span
                                        class="attribute-before">0.15 ability power per second</span> <span
                                        class="change-indicator">⇒</span> <span class="attribute-after">0.25 ability power per second</span>
                                </div>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/WujuStyle.png&resize=32:"/>E
                                    - Wuju Style</h4>
                                <div class="attribute-change"><span class="attribute">TRUE DAMAGE ON-HIT</span>
                                    <span class="attribute-before">12/19/26/33/40</span> <span
                                            class="change-indicator">⇒</span> <span
                                            class="attribute-after">14/23/32/41/50</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/nocturne/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Nocturne.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-nocturne"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/nocturne/">Nocturne</a>
                                </h3><p class="summary">Passive has an AP ratio.</p>
                                
                                <blockquote class="blockquote context">We know what you’re thinking, but let’s
                                    explain. There are an abundance of things in the game that give ability power
                                    incidentally (Guinsoo’s Rageblade, Baron Buff etc), making a number of champions sad
                                    when they can’t utilize it. Giving Nocturne an <em>ever so slight</em> ratio should make
                                    him feel better when these cases arise.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/passive/Nocturne_UmbraBlades.png&resize=32:"/>Passive
                                    - Umbra Blades</h4>
                                <div class="attribute-change"><span class="attribute"><span
                                        class="new">new</span>RATIO</span> <span class="attribute-after">Now additionally scales with 0.15 ability power per hit</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/shyvana/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Shyvana.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-shyvana"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/shyvana/">Shyvana</a>
                                </h3><p class="summary">W has an AP ratio.</p>
                                <blockquote class="blockquote context">Pretty much the same thing as Nocturne’s
                                    context. Re-read that but pretend we said ‘Shyvana’ instead.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/ShyvanaImmolationAura.png&resize=32:"/>W
                                    - Burnout</h4>
                                <div class="attribute-change"><span class="attribute"><span
                                        class="new">new</span>RATIO</span> <span class="attribute-after">Now additionally scales with 0.1 ability power per second</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute"><span
                                        class="new">new</span>RATIO ON-HIT</span> <span class="attribute-after">Now additionally scales with 0.025 ability power on-hit</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/swain/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Swain.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-swain"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/swain/">Swain</a>
                                </h3><p class="summary">Health per level up. R heals
                                    more.</p>
                                <blockquote class="blockquote context">Before we talk about Swain proper,
                                    consider this a public service announcement: Torment’s damage amplification is a flat
                                    20% as of 6.9, which means you shouldn’t level it first.<br/><br/>With that
                                    out of the way, let’s talk Swain. Simply put, Swain’s not being rewarded enough for his
                                    early-game successes, often being ignored or phased out as the game goes on. We’re
                                    looking to tackle this by reinforcing what he’s good at - taking hits on the front lines
                                    and being a sticky drain-tank, especially against teams with multiple tanks. At present,
                                    Swain’s healing is based on the damage dealt - meaning the more magic resist an opponent
                                    has, the less health. This means the burly tanks of the world that Swain’s meant to prey
                                    on in lane quickly turn predator, reducing both Swain’s damage <em>and</em> sustain
                                    through items. We’re flipping the script and letting Swain heal up on tanks with plenty
                                    to spare (as well as upping his own natural durability) to keep his fantasy of being
                                    contextually unkillable alive and well.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title">General</h4>
                                <div class="attribute-change"><span class="attribute">HEALTH GROWTH STAT</span>
                                    <span class="attribute-before">78</span> <span class="change-indicator">⇒</span> <span
                                            class="attribute-after">90</span>
                                </div>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/SwainDecrepify.png&resize=32:"/>Q
                                    - Decrepify</h4>
                                <div class="attribute-change"><span class="attribute">HUNGRY FOR WORMS</span>
                                    <span class="attribute-after">Now executes minions below 10 health</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">NOW THEY WORK</span> <span
                                        class="attribute-after">Fixed a bug where spell effects like Rylai’s Crystal Scepter and Liandry’s Torment weren’t applying properly</span>
                                </div>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/SwainMetamorphism.png&resize=32:"/>R
                                    - Ravenous Flock</h4>
                                <div class="attribute-change"><span
                                        class="attribute">HEALING VS CHAMPIONS</span> <span class="attribute-before">75% of the damage dealt</span>
                                    <span class="change-indicator">⇒</span> <span class="attribute-after">30/45/60 (+0.1 ability power)</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">HEALING VS MINIONS AND MONSTERS</span>
                                    <span class="attribute-before">15% of the damage dealt</span> <span
                                            class="change-indicator">⇒</span> <span class="attribute-after">8/11/13 (+0.03 ability power)</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">FLOCK TOGETHER</span>
                                    <span class="attribute-after">Now prioritizes targets closest to Swain instead of picking them at random (still prioritizes champions over non-champions)</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/taric/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Taric.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-taric"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/taric/">Taric</a>
                                </h3><p class="summary">R is more shiny.</p>
                                <blockquote class="blockquote context">Even for someone that shines as bright as
                                    Taric, Cosmic Radiance can be a little hard to see in teamfights. Given how pivotal it
                                    is to know whether or not people are going to take damage (who’d have thought?), we’ve
                                    put some extra shine on Taric’s biggest moment.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/TaricR.png&resize=32:"/>R
                                    - Cosmic Radiance</h4>
                                <div class="attribute-change"><span class="attribute">WITH CLARITY</span> <span
                                        class="attribute-after">Added a brighter particle that plays when units affected by Cosmic Radiance become invulnerable</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/tryndamere/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Tryndamere.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-tryndamere"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/tryndamere/">Tryndamere</a>
                                </h3><p class="summary">R holds you at a higher threshold. No longer
                                    restores 3% health if below.</p>
                                <blockquote class="blockquote context">Tryndamere had an undocumented mechanic
                                    that would ensure you wouldn’t end at 1hp after his ult expired if you didn’t heal
                                    (which most people didn’t notice, because they’d usually heal after it ended). We’re
                                    just cleaning it up and putting it in the tooltip, since 3% of Tryndamere’s health
                                    almost always ended up at 30-70 health anyways.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/UndyingRage.png&resize=32:"/>R
                                    - Undying Rage</h4>
                                <div class="attribute-change"><span class="attribute">MINIMUM HEALTH</span>
                                    <span class="attribute-before">1</span> <span class="change-indicator">⇒</span> <span
                                            class="attribute-after">30/50/70</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute"><span class="removed">removed</span>AS I LAY DYING</span>
                                    <span class="attribute-removed">No longer heals Tryndamere to 3% of his maximum health (if he was below that) when Undying Rage ends</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/velkoz/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Velkoz.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-velkoz"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/velkoz/">Vel'Koz</a>
                                </h3><p class="summary">Passive and R ratios up.</p>
                                
                                <blockquote class="blockquote context">Vel’Koz’s update was meant to help solve
                                    his ‘spikes early but falls off’ power-curve by giving him meaningful scaling with
                                    ability power (and extra spicy lasers against researched targets). After a patch of
                                    careful research, it’s clear we didn’t go far enough to avoid VK’s drop-off, so we’re
                                    cranking up his scaling.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/passive/Velkoz_Passive.png&resize=32:"/>Passive
                                    - Organic Deconstruction</h4>
                                <div class="attribute-change"><span class="attribute">RATIO</span> <span
                                        class="attribute-before">0.4 ability power</span> <span
                                        class="change-indicator">⇒</span> <span
                                        class="attribute-after">0.5 ability power</span>
                                </div>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/VelkozR.png&resize=32:"/>R
                                    - Life Form Disintegration Ray</h4>
                                <div class="attribute-change"><span class="attribute">RATIO</span> <span
                                        class="attribute-before">1.0 ability power</span> <span
                                        class="change-indicator">⇒</span> <span
                                        class="attribute-after">1.25 ability power</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/vladimir/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Vladimir.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-vladimir"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/vladimir/">Vladimir</a>
                                </h3><p class="summary">R’s healing on champions increased. Q baits
                                    you less.</p>
                                <blockquote class="blockquote context">Our resident blood-mage, Vladimir’s only
                                    partially living up to the expectations set in 6.9. Which is to say Vlad’s
                                    <em>losing</em> quite a lot of health, but not exactly gaining all of it back.
                                    Hemoplague promises a rewarding second wind for a well-placed ultimate, but falls short
                                    of being the lifeline necessary to enable Vlad’s health as a resource. We’re tuning back
                                    his risk/reward paradigm as well as some usability improvements to help Vladimir pull
                                    off the daring low-health plays he’s known for.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/VladimirQ.png&resize=32:"/>Q
                                    - Transfusion</h4>
                                <div class="attribute-change"><span
                                        class="attribute">RIPE FOR THE PICKING</span> <span class="attribute-after">Crimson Rush’s particle now delays until just before Transfusion becomes available</span>
                                </div>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/VladimirE.png&resize=32:"/>E
                                    - Tides of Blood</h4>
                                <div class="attribute-change"><span class="attribute">ROLL TIDE</span> <span
                                        class="attribute-after">Releasing Tides of Blood no longer prematurely cancels Sanguine Pool</span>
                                </div>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/VladimirHemoplague.png&resize=32:"/>R
                                    - Hemoplague</h4>
                                <div class="attribute-change"><span
                                        class="attribute">HEALING VS CHAMPIONS</span> <span class="attribute-before">50% of the damage dealt</span>
                                    <span class="change-indicator">⇒</span> <span class="attribute-after">150/250/350 + 0.7 ability power, increased by 50% for each additional champion hit beyond the first</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/zyra/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/Zyra.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-zyra"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/champions/zyra/">Zyra</a>
                                </h3><p class="summary">Passive-spawned seeds can be stepped on
                                    faster.</p>
                                <blockquote class="blockquote context">Zyra’s Midseason is off to a good start,
                                    comfortably blooming into a botanical powerhouse. We’re not looking to do anything
                                    dramatic - just adjusting Garden of Thorns to be less punishing for those on the wrong
                                    side of the grass.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title ability-title"><img
                                        src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/passive/ZyraP.png&resize=32:"/>Passive
                                    - Garden of Thorns</h4>
                                <div class="attribute-change"><span class="attribute">SEED GRACE PERIOD</span>
                                    <span>Can be stepped on</span> <span
                                            class="attribute-before">1.5 seconds after spawning</span> <span
                                            class="change-indicator">⇒</span> <span class="attribute-after">1 second after spawning <em>(<strong>W
                                        - Rampant Growth</strong> seeds remain at 1.5 seconds of immunity)</em></span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="white-stone accent-before">
                            <div><h3 class="change-title" id="patch-splash-updates">Splash
                                Updates</h3><p class="summary">Tristana’s skin splashes have
                                been updated:</p>
                                <div class="gallery-gradient"></div>
                                
                                <div class="my-carousel">
                                    <div>
                                        <div class="content-border"><a class="skins cboxElement" title="Buccaneer Tristana"
                                                                       href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_5.jpg"><img
                                                src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_5.jpg&resize=588:"/></a>
                                        </div>
                                        <h4>Buccaneer Tristana</h4>
                                    </div>
                                    
                                    <div>
                                        <div class="content-border"><a class="skins cboxElement"
                                                                       title="Earnest Elf Tristana"
                                                                       href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_2.jpg"><img
                                                src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_2.jpg&resize=588:"/></a>
                                        </div>
                                        <h4>Earnest Elf Tristana</h4>
                                    </div>
                                    
                                    <div>
                                        <div class="content-border"><a class="skins cboxElement"
                                                                       title="Firefighter Tristana"
                                                                       href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_3.jpg"><img
                                                src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_3.jpg&resize=588:"/></a>
                                        </div>
                                        <h4>Firefighter Tristana</h4>
                                    </div>
                                    
                                    <div>
                                        <div class="content-border"><a class="skins cboxElement" title="Guerilla Tristana"
                                                                       href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_4.jpg"><img
                                                src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_4.jpg&resize=588:"/></a>
                                        </div>
                                        <h4>Guerilla Tristana</h4>
                                    </div>
                                    
                                    <div>
                                        <div class="content-border"><a class="skins cboxElement" title="Riot Girl Tristana"
                                                                       href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_1.jpg"><img
                                                src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_1.jpg&resize=588:"/></a>
                                        </div>
                                        <h4>Riot Girl Tristana</h4>
                                    </div>
                                    
                                    <div>
                                        <div class="content-border"><a class="skins cboxElement"
                                                                       title="Rocket Girl Tristana"
                                                                       href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_6.jpg"><img
                                                src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Tristana_6.jpg&resize=588:"/></a>
                                        </div>
                                        <h4>Rocket Girl Tristana</h4>
                                    </div>
                                    
                                </div>
                                <br/></div>
                            
                        </div>
                        
                    </div>
                    <p><a href="#patch-top" class="btt">Back to top</a></p>
                    <header class="header-primary"><h2 id="patch-summoner’s-rift">Summoner’s Rift</h2>
                    </header>
                    <div class="content-border">
                        <div class="white-stone accent-before">
                            <div><h3 class="change-title" id="patch-jungle-respawn-timers">Jungle
                                Respawn Timers</h3><p class="summary">Red and Blue minimap
                                respawn icons are smaller.</p>
                                <blockquote class="blockquote context">The size of the buff icons were
                                    cluttering the minimap and giving the feeling that buff contests were as important as
                                    epic monsters. Bringing the size in line with the importance of buffs is a good way to
                                    clear up the minimap landscape to see other things like wards or traps.
                                </blockquote>
                                
                                <div class="attribute-change"><span class="attribute">MINIMAP CLARITY</span>
                                    <span class="attribute-after">Reduced the size of Red & Blue minimap respawn icons</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="white-stone accent-before">
                            <div><h3 class="change-title" id="patch-first-minion-wave">First Minion
                                Wave</h3>
                                <blockquote class="blockquote context">Consistency at the start of the game is
                                    what allows players to make laning decisions. We’ve been honing in on that consistency
                                    with small minion tweaks over many patches, but losing a ranged minion to random chance
                                    could occasionally change the dynamic of laning. Eliminating that outlier should give
                                    players clearer expectations about the laning phase.
                                </blockquote>
                                
                                <div class="attribute-change"><span class="attribute">FOCUS ON THE FRONT</span>
                                    <span class="attribute-after">Minions in the first wave should no longer grab an enemy ranged minion as a target randomly.</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="white-stone accent-before">
                            <div><h3 class="change-title" id="patch-mountain-drake">Mountain
                                Drake</h3><p class="summary">Doesn’t amplify true
                                damage.</p>
                                <blockquote class="blockquote context">True damage offers pretty clear feedback:
                                    the damage you see is the damage you get, no decreases or increases. Mountain Drake was
                                    violating that expectation (especially around smite fights), so we’re bringing it in
                                    line with the rest of the game.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title">Mark of the Mountain Drake</h4>
                                
                                <div class="attribute-change"><span class="attribute">TRULY OUTRAGEOUS</span>
                                    <span class="attribute-after">No longer amplifies true damage (including Smite)</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="white-stone accent-before">
                            <div><h3 class="change-title" id="patch-ocean-drake">Ocean
                                Drake</h3><p class="summary">Now restores health and mana
                                only when out of combat with champions and towers.</p>
                                <blockquote class="blockquote context">Regeneration effects often go unnoticed
                                    by their owners, but the Ocean Drake buff is large and spiky enough that players feel
                                    the individual ticks. The occasional lucky tick right before a killing blow, however,
                                    was adding more frustration than gameplay and often leaving players wondering if their
                                    damage hadn’t gone through. Tying the regen to stay out-of-combat allows more
                                    counterplay to opponents, allowing them to feel less like they’re fighting a rising
                                    tide. Of regeneration.
                                </blockquote>
                                
                                <hr class="divider"/>
                                <h4 class="change-detail-title"><span class="updated">updated</span>Mark of the
                                    Ocean Drake</h4>
                                <div class="attribute-change"><span class="attribute">SEA GOD’S CLAIM</span>
                                    <span class="attribute-after">Restores 4/8/12% of your missing health and mana every 8 seconds if not damaged by a champion or tower in the last 5 seconds</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="white-stone accent-before">
                            <div><h3 class="change-title" id="patch-turrets">Turrets</h3>
                                <p class="summary">Turrets now take less true damage when the backdoor
                                    bonus is in effect.</p>
                                <blockquote class="blockquote context">Turrets have always had a pretty massive
                                    defensive boost to discourage raw backdoor attempts, but with the increased prevalence
                                    of True Damage in the game (Mountain Drake, Red Buff) we’re adjusting to keep it in
                                    line.
                                </blockquote>
                                
                                <div class="attribute-change"><span
                                        class="attribute">REALLY REINFORCED ARMOR</span> <span class="attribute-after">Now additionally absorbs 66% of true damage when the backdoor bonus is in effect</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    <p><a href="#patch-top" class="btt">Back to top</a></p>
                    <header class="header-primary"><h2 id="patch-items">Items</h2></header>
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/items/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/item/1419.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-Enchantment:-Bloodrazor"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/items/">Enchantment:
                                    Bloodrazor</a></h3><p class="summary">Attack speed and
                                    on-hit damage up.</p>
                                <blockquote class="blockquote context">The new Bloodrazor allows junglers like
                                    Shyvana and Master Yi to feel more comfortable interacting with other players early on,
                                    rather than obligated to farm the jungle for twenty minions. That said, thanks to the
                                    relatively weak combat strength of Bloodrazor, they’re not enjoying the results of those
                                    interactions. Without being pinned to farming, attack speed junglers have reasons to
                                    duel enemy junglers, gank, or otherwise scrap for early-mid game advantages - they just
                                    need reasons to believe they can win those duels. Upping combat strength is the solution
                                    here.
                                </blockquote>
                                
                                <div class="attribute-change"><span class="attribute">ATTACK SPEED</span> <span
                                        class="attribute-before">40%</span> <span class="change-indicator">⇒</span> <span
                                        class="attribute-after">50%</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">ON-HIT DAMAGE</span> <span
                                        class="attribute-before">3% of the target’s maximum health</span> <span
                                        class="change-indicator">⇒</span> <span class="attribute-after">4% of the target’s maximum health</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    <p><a href="#patch-top" class="btt">Back to top</a></p>
                    <header class="header-primary"><h2 id="patch-summoner-spells">Summoner Spells</h2>
                    </header>
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/summoners/spells/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/SummonerBarrier.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-Barrier"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/summoners/spells/">Barrier</a>
                                </h3><p class="summary">Cooldown decreased.</p>
                                <blockquote class="blockquote context">Right now, Barrier doesn’t really have
                                    anything to differentiate it from Heal, leaving it outclassed by the less temporary
                                    nature of Heal. A lower cooldown should offer Barrier a unique identity as the go-to
                                    summoner spell against repeated assassin all-ins.
                                </blockquote>
                                
                                <div class="attribute-change"><span class="attribute">COOLDOWN</span> <span
                                        class="attribute-before">210 seconds</span> <span class="change-indicator">⇒</span>
                                    <span class="attribute-after">180 seconds</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <div class="content-border">
                        <div class="patch-change-block white-stone accent-before">
                            <div><a class="reference-link"
                                              href="http://gameinfo.na.leagueoflegends.com/en/game-info/summoners/spells/"><img
                                    src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/6.9.1/img/spell/SummonerHaste.png&resize=64:"/></a>
                                <h3 class="change-title" id="patch-Ghost"><a
                                        href="http://gameinfo.na.leagueoflegends.com/en/game-info/summoners/spells/">Ghost</a>
                                </h3><p class="summary">Cooldown decreased. Movement speed scales with
                                    level.</p>
                                <blockquote class="blockquote context">With the removal of Distortion Boots,
                                    Ghost lost out on the scaling power it had come to rely on. Given Ghost’s consistent
                                    underselection relative to Flash, buffing the summoner spell won’t make it a must take,
                                    while still keeping the late game feel it previously had.
                                </blockquote>
                                
                                <div class="attribute-change"><span class="attribute">COOLDOWN</span> <span
                                        class="attribute-before">210</span> <span class="change-indicator">⇒</span> <span
                                        class="attribute-after">180</span>
                                </div>
                                
                                <div class="attribute-change"><span
                                        class="attribute">MOVEMENT SPEED BONUS</span> <span class="attribute-before">27% at all levels</span>
                                    <span class="change-indicator">⇒</span> <span class="attribute-after">28-45% (at levels 1-18)</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <header class="header-primary"><h2 id="patch-dynamic-queue">Dynamic Queue</h2>
                    </header>
                    <div class="content-border">
                        <div class="white-stone accent-before">
                            <div><p class="summary">Rolling out later this patch: several adjustments
                                and improvements targeting high MMR matchmaking in dynamic queue. </p>
                                <blockquote class="blockquote context">Our goals are lowering queue times and
                                    improving match quality above Diamond tier with a set of solutions addressing those two
                                    issues. We’ll share more during this patch. 
                                </blockquote>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                    <header class="header-primary"><h2 id="patch-champion-mastery">Champion Mastery</h2>
                    </header>
                    <div class="content-border">
                        <div class="white-stone accent-before">
                            <div><p class="summary">Champion Mastery Levels 6 and 7 are coming this
                                patch.</p>
                                <blockquote class="blockquote context">Mastery Levels 6 and 7 better emphasize
                                    skill by requiring S grades from matchmade games. We’re emphasizing a performance
                                    requirement alongside a dedication component (the time needed to unlock free chests or
                                    earn IP for champ shards or permanent loot) to build on the original system’s blend of
                                    skill and participation. Keep an eye out for a larger announcement soon!
                                </blockquote>
                                
                                <div class="attribute-change"><span
                                        class="attribute">MORE MASTERFUL MASTERY</span> <span class="attribute-after">Earn new mastery badge emotes, loading screen border flags, and announcement banner upgrades for each level</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">DING</span> <span
                                        class="attribute-after">Earn <strong>Mastery 6</strong> tokens for <strong>S-,
                                    S,</strong> and <strong>S+</strong> games with champs that are Mastery Level 5</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">DING DING</span> <span
                                        class="attribute-after">Earn <strong>Mastery
                                    7</strong> tokens for <strong>S</strong> and <strong>S+</strong> games with champs that are Mastery Level 6</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">HEXTECH MASTERY</span>
                                    <span class="attribute-after">Combine Mastery tokens for a specific champ with that champ’s crafting shard, permanent loot, or blue essence to unlock their next mastery level</span>
                                </div>
                                
                                <div class="attribute-change"><span class="attribute">ZOINKS!</span> <span
                                        class="attribute-after">We’re adding a new mystery champ item to the store for RP or IP in a future patch that’ll help offset the RNG of finding champ shards and permanents in chests</span>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    <p><a href="#patch-top" class="btt">Back to top</a></p>
                    <header class="header-primary"><h2 id="patch-bugfixes">Bugfixes</h2></header>
                    <div class="content-border">
                        <div class="white-stone accent-before">
                            <div>
                                <ul>
                                    <li>Fixed a false error message that occurred when entering a game lobby</li>
                                    
                                    <li>Final Boss Veigar's <strong>Q - Baleful Strike</strong> no longer turns units
                                        invisible when killing them
                                    </li>
                                    
                                    <li>Fixed a number of interactions with Cassiopeia's <strong>W - Miasma</strong>
                                        Grounded debuff
                                    </li>
                                    
                                    <li>Varus's <strong>Q - Piercing Arrow</strong> no longer occasionally deals damage
                                        against spell shielded targets
                                    </li>
                                    
                                    <li>Annie’s <strong>R - Summon: Tibbers</strong> cooldown no longer resets to full if
                                        Tibbers lives past the end of the ability’s cooldown
                                    </li>
                                    
                                    <li>Frozen Heart’s aura no longer pops Malzahar’s <strong>Passive - Void Shift</strong>
                                    </li>
                                    
                                    <li>Fixed a bug where Ahri’s <strong>W - Fox-Fire</strong> could spawn less than three
                                        flames if cast at the same time as Ahri used Flash
                                    </li>
                                    
                                    <li>Zigg’s <strong>Passive - Short Fuse</strong> cooldown is now properly reduced when
                                        casting spells while <strong>W - Satchel Charge</strong> is active
                                    </li>
                                    
                                    <li>Fixed a bug where Zyra’s <strong>Q - Deadly Spines</strong> could cause the wrong
                                        seeds to spawn Thornspitters
                                    </li>
                                    
                                    <li>Fixed a bug where flat armor reduction effects (ex. Nasus’s <strong>E - Spirit
                                        Fire</strong>) reduced jungle monster armor by more than the intended amount as
                                        monster stats scaled over time
                                    </li>
                                    
                                    <li>The Lifeline cooldown of Sterak's Gage no longer resets to full after the Sterak's
                                        Fury buff expires
                                    </li>
                                    
                                    <li>Fixed a bug where Zz'Rot Portal's Voidspawn were ignoring minions</li>
                                    
                                    <li>Restored Curling Veigar’s vintage border for players who owned him as a limited
                                        skin
                                    </li>
                                    
                                </ul>
                            </div>
                            
                        </div>
                        
                    </div>
                    <p><a href="#patch-top" class="btt">Back to top</a></p>
                    <header class="header-primary"><h2 id="patch-upcoming-skins">Upcoming Skins</h2>
                    </header>
                    <div class="content-border">
                        <div class="white-stone accent-before">
                            <div><p class="summary">The following skins will be released during patch
                                6.10:</p>
                                <div class="gs-container default-2-col">
                                    <div class="skin-box"><span class="content-border"><a
                                            class="skins cboxElement" title="Freljord Taliyah"
                                            href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Taliyah_1.jpg"><img
                                            src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Taliyah_1.jpg&resize=256:"/></a></span>
                                        <h4 class="skin-title"><a
                                                href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Taliyah_1.jpg">Freljord
                                            Taliyah</a></h4>
                                    </div>
                                    
                                    <div class="skin-box"><span class="content-border"><a
                                            class="skins cboxElement" title="Super Galaxy Fizz"
                                            href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Fizz_9.jpg"><img
                                            src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Fizz_9.jpg&resize=256:"/></a></span>
                                        <h4 class="skin-title"><a
                                                href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Fizz_9.jpg">Super
                                            Galaxy Fizz</a></h4>
                                    </div>
                                    
                                    <div class="skin-box"><span class="content-border"><a
                                            class="skins cboxElement" title="Super Galaxy Kindred"
                                            href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Kindred_2.jpg"><img
                                            src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Kindred_2.jpg&resize=256:"/></a></span>
                                        <h4 class="skin-title"><a
                                                href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Kindred_2.jpg">Super
                                            Galaxy Kindred</a></h4>
                                    </div>
                                    
                                    <div class="skin-box"><span class="content-border"><a
                                            class="skins cboxElement" title="Super Galaxy Shyvana"
                                            href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Shyvana_6.jpg"><img
                                            src="https://am-a.akamaihd.net/image?f=http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Shyvana_6.jpg&resize=256:"/></a></span>
                                        <h4 class="skin-title"><a
                                                href="http://news.cdn.leagueoflegends.com/public/images/articles/2016/may/pn610/Shyvana_6.jpg">Super
                                            Galaxy Shyvana</a></h4>
                                    </div>
                                    
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                </div>
                <p><a href="#patch-top" class="btt">Back to top</a></p></div>
        </div>
        <div class="riot-news-widget-shadow"></div>
    </div>
    <script type="text/javascript">(function () {/* If require is not defined add it using JSThis will prevent adding it to a context were already exists */
        if (typeof require === 'undefined') {
            var rs = document.createElement('script');
            rs.type = 'text/javascript';
            rs.src = 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/vendors/require.js';
            document.getElementsByTagName('head')[0].appendChild(rs);
        }
        var Conditional = {postponeConditional: postponeConditional, executeConditional: executeConditional};
    
        function postponeConditional(funcCondition, funcBehavior) {
            setTimeout(function () {
                Conditional.executeConditional(funcCondition, funcBehavior), 100
            });
        };
        function executeConditional(funcCondition, funcBehavior) {
            if (!funcCondition()) {
                return Conditional.postponeConditional(funcCondition, funcBehavior);
            }
            funcBehavior();
        };
        Conditional.executeConditional(function () {
            return typeof require !== 'undefined';
        }, function () {
            var requireDefine;
            if (typeof window.oembedRequireJs === 'undefined') {
                requireDefine = require.config({
                    paths: {
                        ping: 'https://lolstatic-a.akamaihd.net/ping/ping-0.1.240.min',
                        jquery: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/vendors/jquery',
                        youtubeIframeAPI: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/vendors/youtubeiframeapi',
                        oembedsFullModeMsg: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/oembeds-full-mode-messages',
                        fullWindowUtils: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/full-window-utils',
                        backToTop: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/back-to-top',
                        q: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/vendors/q',
                        riotToc: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/riot-toc',
                        videoUtils: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/video-utils',
                        riotKitCycle: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/riot-kit-cycle',
                        imageUtils: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/image-utils',
                        templatesInitialization: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/templates-initialization',
                        pingGlobalConfig: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/ping-global-config',
                        sharedStates: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/shared-states',
                        linkUtils: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/link-utils',
                        pingTracking: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/ping-onload-tracking',
                        styleFix: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/stylefix',
                        landingpage: 'https://news-a.akamaihd.net/public/oembed/0.0.273/js/requiremodules/landingpage',
                        timeago: 'https://lolstatic-a.akamaihd.net/lib/jquery-timeago/1.4.1/jquery.timeago',
                        timeagoTranslation: 'https://lolstatic-a.akamaihd.net/lib/jquery-timeago/1.4.1/locales/jquery.timeago.'
                    },
                    shim: {
                        youtubeIframeAPI: {exports: 'YT'},
                        q: {exports: 'Q'},
                        ping: {exports: 'ping'},
                        riotToc: {deps: ['jquery']},
                        riotKitCycle: {deps: ['jquery']},
                        timeagoTranslation: {deps: ['timeago']}
                    },
                    waitSeconds: 60
                });
                window.oembedRequireJs = requireDefine;
            } else {
                requireDefine = window.oembedRequireJs;
            }
            requireDefine(['pingGlobalConfig', 'sharedStates'], function (pcfg, sharedStates) {
                sharedStates.pingGlobalConfigRegisterEventListener();
                sharedStates.getPingGlobalConfig().then(function (cfg) {
                    if (cfg) {
                        pcfg(cfg);
                    } else {
                        pcfg({"appname": "news_oembed", "env": "prod", "meta": {}});
                    }
                    requireDefine(['pingTracking'], function (pingTracking) {
                        pingTracking.trackInId('oembed-9817259940318763');
                    });
                });
                requireDefine(['templatesInitialization'], function (initializer) {
                    initializer.initPatchNotesScripts('oembed-wrapper-bb3934c1efcdfcfb0004109179ef438e');
                });
            });
        });
    })();</script>
    <link rel="stylesheet" type="text/css" href="https://news-a.akamaihd.net/public/oembed/0.0.273/css/oembed.css">
    </body>
    </html>`)
})
route.get(['/'], (req,res)=>{

    res.setHeader('type',"application/json+oembed")
    res.json({
        "version": "1.0",
        "type": "video",
        "provider_name": "YouTube",
        "provider_url": "http://youtube.com/",
        "width": 425,
        "height": 344,
        "title": "Amazing Nintendo Facts",
        "author_name": "ZackScott",
        "author_url": "http://www.youtube.com/user/ZackScott",
        "html":
            `<object width="425" height="344">
                <param name="movie" value="http://www.youtube.com/v/M3r2XDceM6A&fs=1"></param>
                <param name="allowFullScreen" value="true"></param>
                <param name="allowscriptaccess" value="always"></param>
                <embed src="http://www.youtube.com/v/M3r2XDceM6A&fs=1"
                    type="application/x-shockwave-flash" width="425" height="344"
                    allowscriptaccess="always" allowfullscreen="true"></embed>
            </object>`,
    })

 
}) 


module.exports = route