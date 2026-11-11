/**
 * Source list for /calculators/stacks/. scripts/build-stacks.js runs the
 * existing solver against every row and writes the static pages.
 * Do not add an AskMachinist worked-stack size+set (inch-81: 0.4375, 0.5625,
 * 1.2345, 1.3750, 1.8125, 2.1875, 3.4567, 5.6789; metric-88: 12.345, 25.4,
 * 47.625, 63.5, 99.995, 150.123). Link those from the index instead.
 */
module.exports = [
  {
    slug: '0.105-in-81', target: '0.105', set: 'inch-81', wear: false, landing: true,
    use: 'The low check of a 0–1 in micrometer. A zero check only shows that the anvils meet. 0.105 in moves the spindle off zero.',
    context: 'This size is one block. The 81-piece thousandths series runs from 0.101 in through 0.149 in, and 0.105 in is in that series. The next micrometer check, 0.210 in, is not one block.',
  },
  {
    slug: '0.210-in-81', target: '0.210', set: 'inch-81', wear: false, landing: true,
    use: 'The middle check of a 0–1 in micrometer, between 0.105 in and 0.315 in, so the spindle stops at a different thimble reading than zero.',
    context: 'There is no 0.210 in block. 0.110 in is in the thousandths series and 0.100 in is in the 0.050 in series. One joint. 0.105 in, the check below this one, is a single block.',
  },
  {
    slug: '0.2500-in-81', target: '0.250', set: 'inch-81', wear: false, landing: false,
    use: 'A quarter-inch setup, spacer, or check size. Reach for the 0.250 in block before combining smaller pieces.',
    context: 'The 0.050 in series includes 0.250 in, so the fewest stack is that one block. The set contains only one of each size, so two smaller blocks are not a spare quarter inch. The next eighth, 0.375 in, is two blocks.',
  },
  {
    slug: '0.2608-in-81', target: '0.2608', set: 'inch-81', wear: false, landing: true,
    use: 'Basic 1/4-20 UNC three-wire size. AskMachinist’s chart lists 0.26083 in over wires. An 81-piece set steps by 0.0001 in, so the stack is 0.2608 in.',
    context: '0.1008 in is the block that clears the 8 in the fourth decimal. That series is 0.1001 in through 0.1009 in, one of each. 0.110 in and 0.050 in finish the length. 0.2608 in is the nearer tenth of a thousandth to 0.26083 in; do not step up to 0.2609 in.',
  },
  {
    slug: '0.315-in-81', target: '0.315', set: 'inch-81', wear: false, landing: true,
    use: 'The high check of a 0–1 in micrometer. Together with 0.105 in and 0.210 in it tests the spindle in three places, not only at zero.',
    context: '0.115 in clears the thousandths. The thousandths series runs from 0.101 in to 0.149 in, so 0.115 in is a real block. 0.200 in, from the 0.050 in series, supplies the two tenths.',
  },
  {
    slug: '0.375-in-81', target: '0.375', set: 'inch-81', wear: false, landing: false,
    use: 'Three-eighths of an inch. A packing piece or a step that is not its own block in the 0.050 in series.',
    context: '0.375 in is 0.250 in plus 0.125 in. Both are in the 0.050 in series, which steps from 0.050 in through 0.950 in. There is no 0.375 in block to pick up instead.',
  },
  {
    slug: '0.5000-in-81', target: '0.500', set: 'inch-81', wear: false, landing: true,
    use: 'Half an inch. The setup height and micrometer check people reach for before they start combining smaller blocks.',
    context: 'The 0.050 in series includes 0.500 in, so the fewest stack is that single block. Two 0.250 in blocks are not available; the set has one 0.250 in block. Keep the half-inch block for this size.',
  },
  {
    slug: '0.625-in-81', target: '0.625', set: 'inch-81', wear: false, landing: true,
    use: 'Five-eighths of an inch on an 81-piece set. The same nominal size on a 36-piece set uses a different stack.',
    context: '0.500 in plus 0.125 in. Both sit in the 0.050 in series. A 36-piece set’s fewest stack for 0.625 in is 0.400 + 0.120 + 0.105, because that set is not built from the same 0.050 in steps.',
  },
  {
    slug: '0.7500-in-81', target: '0.750', set: 'inch-81', wear: false, landing: true,
    use: 'Three-quarter inch with no wear blocks. A common height-gage or micrometer check, and a single block in this set.',
    context: 'The 0.050 in series includes 0.750 in. Leave it as that one block. The wear-block recipe for the same nominal size is different: two 0.050 in wear blocks sit on the ends and the inside block becomes 0.650 in.',
  },
  {
    slug: '0.8682-in-81', target: '0.8682', set: 'inch-81', wear: false, landing: true,
    use: 'Stack height for a 5 in sine bar at 10 degrees, after rounding to 0.0001 in. 5 × sin(10°) is 0.86824089 in, which is 0.00004089 in above 0.8682 in.',
    context: '0.1002 in clears the fourth decimal. 0.118 in clears the thousandths that remain. 0.650 in finishes the size. The sine bar page computes the height; this page is only the block stack for the rounded number.',
  },
  {
    slug: '0.875-in-81', target: '0.875', set: 'inch-81', wear: false, landing: false,
    use: 'Seven-eighths of an inch. Two blocks, unlike the half-inch and quarter-inch sizes, which are each one block.',
    context: '0.750 in and 0.125 in are both in the 0.050 in series. There is no 0.875 in block. Wring the 0.750 in block first, then 0.125 in.',
  },
  {
    slug: '1.0000-in-81', target: '1.000', set: 'inch-81', wear: false, landing: true,
    use: 'A one-inch reference for a micrometer, a height gage, or a setup that wants a full inch with no wrung joint.',
    context: 'The whole-inch blocks in an 81-piece set are 1, 2, 3, and 4 in, one of each. 1.000 in is the 1 in block. The next size in this library, 1.250 in, adds the 0.250 in block on top of it.',
  },
  {
    slug: '1.250-in-81', target: '1.250', set: 'inch-81', wear: false, landing: false,
    use: '1-1/4 in. A spacer or a height that sits between the 1 in block and the 2 in block.',
    context: '1.000 in plus 0.250 in. The whole inch is its own block, and 0.250 in is in the 0.050 in series. One joint. Do not split the quarter inch into smaller pieces while 0.250 in is in the set.',
  },
  {
    slug: '1.500-in-81', target: '1.500', set: 'inch-81', wear: false, landing: false,
    use: '1-1/2 in, a setup height between the 1 in and 2 in blocks, built from those two pieces of the set.',
    context: 'The set has one 1 in block and one 0.500 in block. Do not break the half inch into smaller blocks. There is only one 0.250 in block, and the 0.500 in block is already the right piece.',
  },
  {
    slug: '2.5000-in-81', target: '2.500', set: 'inch-81', wear: false, landing: true,
    use: '2.500 in is two blocks, and it is also the exact stack height for a 5 in sine bar at 30 degrees, because sin(30°) is 1/2.',
    context: 'Wring the 2 in block and the 0.500 in block. Both are single blocks in the set, so the stack has one joint. A 10 degree angle on the same 5 in bar is a different, rounded height: 0.8682 in.',
  },
  {
    slug: '4.0000-in-81', target: '4.000', set: 'inch-81', wear: false, landing: false,
    use: 'The longest block in a standard 81-piece inch set. Use it when a stack would otherwise start by wringing the 3 in and 1 in blocks.',
    context: 'One block. 3.000 in plus 1.000 in reaches the same length, spends two of the four whole-inch blocks, and adds a joint. Keep 3 in and 1 in for other setups.',
  },
  {
    slug: '0.420-in-81', target: '0.420', set: 'inch-81', wear: false, landing: true,
    use: 'The next 0–1 in micrometer check after 0.315 in. Shops usually step 0.105, 0.210, 0.315, 0.420, 0.525, 0.630, 0.735, 0.840, and 0.945 in so the spindle stops off the previous line.',
    context: 'There is no 0.420 in block. 0.120 in is in the thousandths series, 0.101 in through 0.149 in. 0.300 in is in the 0.050 in series, 0.050 in through 0.950 in. One joint. The check below this one, 0.315 in, is 0.200 in plus 0.115 in.',
  },
  {
    slug: '1.125-in-81', target: '1.125', set: 'inch-81', wear: false, landing: false,
    use: '1-1/8 in. A spacer or a height between the 1 in block and the 1-1/4 in stack, when the drawing is in eighths of an inch.',
    context: '1.000 in plus 0.125 in. The whole inch is its own block. 0.125 in is in the thousandths series, 0.101 in through 0.149 in, not a 0.050 in step. One joint. There is no 1.125 in block. 1.250 in, the next size up in this library, adds 0.250 in instead.',
  },
  {
    slug: '2.0000-in-81', target: '2.000', set: 'inch-81', wear: false, landing: true,
    use: 'The 2 in reference for a 1–2 in micrometer, a height gage, or a setup that wants two full inches and no wrung joint.',
    context: 'The whole-inch blocks in an 81-piece set are 1, 2, 3, and 4 in, one of each. 2.000 in is the 2 in block. Two 1 in blocks are not in the box. The 1 in page and the 4 in page are the other single whole-inch blocks already written out.',
  },
  {
    slug: '3.5355-in-81', target: '3.5355', set: 'inch-81', wear: false, landing: true,
    use: 'Stack height for a 5 in sine bar at 45 degrees, after rounding to 0.0001 in. 5 × sin(45°) is 3.53553391 in, which is 0.00003391 in above 3.5355 in.',
    context: '0.1005 in clears the fourth decimal. That series is 0.1001 in through 0.1009 in. 0.135 in clears the thousandths that remain, from the 0.101 in through 0.149 in series. 0.300 in is in the 0.050 in series, and 3.000 in is the 3 in block. A 30 degree angle on the same 5 in bar is the exact 2.500 in stack.',
  },
  {
    slug: '0.7505-in-36', target: '0.7505', set: 'inch-36', wear: false, landing: true,
    use: 'The worked example on the 36-piece calculator page. 0.7505 in ends in 5 at the fourth decimal, so the stack has to use a 0.1005-series block.',
    context: 'A 36-piece set includes 0.1001 in through 0.1009 in, and 0.1005 in clears that 5. 0.150 in is in the hundredths series (0.110 in through 0.190 in), and 0.500 in is in the tenths series. Three blocks.',
  },
  {
    slug: '0.625-in-36', target: '0.625', set: 'inch-36', wear: false, landing: true,
    use: 'Five-eighths of an inch when the box on the bench is a 36-piece set, not an 81-piece set.',
    context: 'This set’s fewest stack is 0.400 + 0.120 + 0.105. 0.400 in is in the 0.100–0.500 in series, 0.120 in is in the hundredths series, and 0.105 in is in the thousandths series. The 81-piece recipe for the same size is 0.500 + 0.125.',
  },
  {
    slug: '0.255-in-36', target: '0.255', set: 'inch-36', wear: false, landing: true,
    use: 'A quarter inch plus five thousandths. The size that shows up when a 0.250 in dimension picks up a small allowance.',
    context: 'Two blocks: 0.150 in and 0.105 in. The 36-piece hundredths series includes 0.150 in, and the thousandths series includes 0.105 in. There is no 0.255 in block in the set.',
  },
  {
    slug: '0.250-in-36', target: '0.250', set: 'inch-36', wear: false, landing: true,
    use: 'A quarter inch on a 36-piece set. The 81-piece set has a 0.250 in block for this size. This set does not, so the quarter inch is two blocks.',
    context: '0.200 in is in the 0.100 in series, 0.100 in through 0.500 in, and 0.050 in is the single fiftieth block. One joint. Do not look for a 0.250 in block in a 36-piece box. The 81-piece recipe for the same nominal size is that one block.',
  },
  {
    slug: '0.375-in-36', target: '0.375', set: 'inch-36', wear: false, landing: true,
    use: 'Three-eighths of an inch on a 36-piece set. The 81-piece recipe for the same size is 0.250 + 0.125, and this set has neither of those blocks.',
    context: '0.170 in is in the hundredths series, 0.110 in through 0.190 in. 0.105 in is in the thousandths series, 0.101 in through 0.109 in. 0.100 in is in the 0.100 in series. Three blocks. The set steps by 0.100 in from 0.100 in up, so it has no 0.300 in plus 0.075 in path.',
  },
  {
    slug: '0.12345-in-28', target: '0.12345', set: 'inch-28', wear: false, landing: true,
    use: 'The worked example for a 28-piece thin set. The size runs to the fifth decimal, which only the 0.02005 in block can clear.',
    context: '0.02005 in takes the final 5. 0.0204 in clears the ten-thousandths that remain. 0.023 in clears the thousandths. 0.060 in finishes it. An 81-piece set has no 0.02005 in block, so this exact size belongs to the thin set.',
  },
  {
    slug: '0.10005-in-28', target: '0.10005', set: 'inch-28', wear: false, landing: true,
    use: 'One tenth plus the half tenth that a 28-piece thin set is built to make. A short stack, and a check that the 0.02005 in block is in the box.',
    context: 'Two blocks: 0.080 in and 0.02005 in. 0.080 in is in the 0.010 in series (0.010 in through 0.090 in). Nothing else in this set clears a fifth-decimal 5.',
  },
  {
    slug: '0.240-in-28', target: '0.240', set: 'inch-28', wear: false, landing: true,
    use: 'Near the top of a 28-piece thin set. The working range of that set is about 0.020 in to 0.240 in.',
    context: 'Three blocks from the 0.010 in series: 0.090, 0.080, and 0.070 in. The set has no 0.100 in block and no long blocks, so 0.240 in cannot be a single piece.',
  },
  {
    slug: '0.100-in-28', target: '0.100', set: 'inch-28', wear: false, landing: true,
    use: 'One tenth of an inch on a 28-piece thin set. A short check inside that set’s working range, about 0.020 in to 0.240 in, and not a single block.',
    context: 'There is no 0.100 in block. The 0.010 in series runs from 0.010 in through 0.090 in, so 0.090 in and 0.010 in are both real blocks. Two blocks. An 81-piece set makes 0.100 in with the one 0.100 in block. This thin set does not have it.',
  },
  {
    slug: '0.125-in-28', target: '0.125', set: 'inch-28', wear: false, landing: true,
    use: 'One-eighth inch on a 28-piece thin set. The size sits inside the working range, and the set has no 0.125 in block to pick up.',
    context: '0.090 in and 0.010 in are in the 0.010 in series, 0.010 in through 0.090 in. 0.025 in is in the thousandths series, 0.021 in through 0.029 in. Three blocks. There is no 0.100 in block that would shorten this stack. 0.240 in, the long end of the set, is a different three-block stack.',
  },
  {
    slug: '10.00-mm-112', target: '10', set: 'metric-112', wear: false, landing: true,
    use: 'A 10 mm check near the start of travel on a 0–25 mm micrometer, where a zero check would miss the spindle.',
    context: 'On a 112-piece set the 0.5 mm series includes 10 mm, so this is one block. The set also contains a 5 mm block, but 5 + 5 is impossible because there is only one 5 mm block. Pick up the 10 mm block.',
  },
  {
    slug: '12.50-mm-112', target: '12.5', set: 'metric-112', wear: false, landing: true,
    use: '12.5 mm, one block in the 0.5 mm series. It is not half an inch. Half an inch is 12.7 mm.',
    context: 'Use the 12.5 mm block. AskMachinist’s inch-to-mm chart covers 12.7 mm and the other half-inch steps. This page stays on 12.5 mm, which the 112-piece set makes with a single block.',
  },
  {
    slug: '20.00-mm-112', target: '20', set: 'metric-112', wear: false, landing: false,
    use: '20 mm, still inside the 112-piece 0.5 mm series. That series runs from 0.5 mm through 24.5 mm.',
    context: 'One block. 24.5 mm is the last half-millimetre step, so 20 mm does not need a long block. The 25 mm page is the first size that leaves this series.',
  },
  {
    slug: '25.00-mm-112', target: '25', set: 'metric-112', wear: false, landing: true,
    use: '25 mm, the first long block in a 112-piece set. Not 25.4 mm. One inch is 25.4 mm, and AskMachinist already has that stack.',
    context: 'The 0.5 mm series stops at 24.5 mm. 25 mm is its own block, with 50, 75, and 100 mm. Do not build 25 mm as 24.5 + 0.5 while the 25 mm block is in the set; that adds a joint.',
  },
  {
    slug: '41.125-mm-112', target: '41.125', set: 'metric-112', wear: false, landing: true,
    use: 'The worked example on the 112-piece calculator page. 41.125 mm ends in 5 at the third decimal, so the stack uses the 1.005 mm block.',
    context: '1.005 mm clears the thousandths. 1.12 mm clears the hundredths; the 0.01 mm series runs from 1.01 mm through 1.49 mm. The remainder is 39 mm, which is 25 + 14, and 14 mm is in the 0.5 mm series. An 88-piece set builds the same target as 30 + 9 + 1.12 + 1.005.',
  },
  {
    slug: '50.00-mm-112', target: '50', set: 'metric-112', wear: false, landing: false,
    use: 'The 50 mm long block. A 112-piece set has one 50 mm block, separate from the 25 mm block.',
    context: 'One block. 25 + 25 is not in the set. If the 50 mm block is out for calibration, the calculator can rebuild the size from smaller blocks, and that stack will be longer.',
  },
  {
    slug: '75.00-mm-112', target: '75', set: 'metric-112', wear: false, landing: false,
    use: 'The 75 mm long block, the third of the four long blocks in a 112-piece set: 25, 50, 75, and 100 mm.',
    context: 'One block. 50 + 25 spends two long blocks and adds a joint. Take the 75 mm block off the rack first.',
  },
  {
    slug: '100.00-mm-112', target: '100', set: 'metric-112', wear: false, landing: true,
    use: 'The 100 mm block, the longest block in a 112-piece metric set, for a stack that should not spend the 75 mm and 25 mm blocks.',
    context: 'One block. 75 + 25 uses the two other long blocks and a wrung joint this size does not need. An 88-piece set also contains a 100 mm block, in its 10 mm series.',
  },
  {
    slug: '12.70-mm-112', target: '12.7', set: 'metric-112', wear: false, landing: false,
    use: 'Half an inch, written in millimetres. 12.7 mm is 0.500 in. It is the conversion when the drawing is inch and the blocks on the bench are metric. It is not the 12.5 mm block.',
    context: '12.5 mm is one block in the 0.5 mm series, and it is 0.2 mm short of half an inch. 11.5 mm is in that same series, 0.5 mm through 24.5 mm. 1.2 mm is in the 0.01 mm series, 1.01 mm through 1.49 mm. Two blocks. Do not wring 12.5 mm and call it 12.7 mm.',
  },
  {
    slug: '30.00-mm-112', target: '30', set: 'metric-112', wear: false, landing: false,
    use: '30 mm, a common spacer and height-gage check. The 112-piece set has no 30 mm block. Its long blocks are 25, 50, 75, and 100 mm.',
    context: '25 mm is the first long block and 5 mm is in the 0.5 mm series, 0.5 mm through 24.5 mm. One joint. 24.5 mm plus something else is a longer stack, and there is no 5.5 mm block. An 88-piece set does contain a 30 mm block, in its 10 mm series. This page stays on the 112-piece set.',
  },
  {
    slug: '25.00-mm-88', target: '25', set: 'metric-88', wear: false, landing: true,
    use: '25 mm on an 88-piece set. This set has no 25 mm block. The 112-piece set does, and that page is a single block.',
    context: 'The 88-piece long series steps by 10 mm, so 25 mm is 20 + 5. 20 mm is in the 10 mm series and 5 mm is in the 0.5 mm series, which stops at 9.5 mm. Do not look for a 25 mm block in this box.',
  },
  {
    slug: '41.125-mm-88', target: '41.125', set: 'metric-88', wear: false, landing: true,
    use: 'The same 41.125 mm target as the 112-piece recipe, built on an 88-piece set whose long blocks step by 10 mm.',
    context: '1.005 mm and 1.12 mm match the first two blocks of the 112-piece stack. The remainder, 39 mm, is not 25 + 14 on this set. It is 30 + 9: 30 mm is in the 10 mm series, and 9 mm is in the 0.5 mm series, which stops at 9.5 mm.',
  },
  {
    slug: '17.365-mm-88', target: '17.365', set: 'metric-88', wear: false, landing: true,
    use: 'Stack height for a 100 mm sine bar at 10 degrees, rounded to 0.001 mm. 100 × sin(10°) is 17.36481777 mm, which is 0.00018223 mm under 17.365 mm.',
    context: '1.005 mm clears the thousandths. 1.36 mm clears the hundredths. 10 mm and 5 mm are in the 0.5 mm series and finish the size. The repeating step of this set is 0.001 mm. The single 1.0005 mm block is not a 0.0005 mm step for every height, so the sine height is rounded to 0.001 mm.',
  },
  {
    slug: '15.00-mm-88', target: '15', set: 'metric-88', wear: false, landing: true,
    use: '15 mm on an 88-piece set. This set has no 15 mm block. A 112-piece set does, in the 0.5 mm series, and that size is one block there.',
    context: 'The 88-piece 0.5 mm series stops at 9.5 mm. 10 mm is in the 10 mm series and 5 mm is in the 0.5 mm series. One joint. Do not look for a 15 mm block in this box. 25 mm on the same set is the same kind of gap: 20 mm plus 5 mm, because the long steps are 10 mm.',
  },
  {
    slug: '12.70-mm-88', target: '12.7', set: 'metric-88', wear: false, landing: true,
    use: 'Half an inch on an 88-piece metric set. 12.7 mm is 0.500 in. The 112-piece stack for the same target is two blocks, because that set has an 11.5 mm block.',
    context: '10 mm is in the 10 mm series. The 0.5 mm series stops at 9.5 mm, so the 2.7 mm that remain are not one block. 1.5 mm is in the 0.5 mm series and 1.2 mm is in the 0.01 mm series, 1.01 mm through 1.49 mm. Three blocks. 12.5 mm is not half an inch.',
  },
  {
    slug: '2.3456-in-81-wear', target: '2.3456', set: 'inch-81', wear: true, landing: true,
    use: 'The worked example on the wear-block page. 2.3456 in with a 0.050 in wear block on each end.',
    context: 'Largest block first, the calculator lists 2.000 + 0.145 + 0.1006 + 0.050 + 0.050. Wring one 0.050 in wear block, then 2.000, 0.145, and 0.1006, then the other wear block. The two 0.050 in blocks belong on the outside. They are not a 0.100 in block in the middle.',
  },
  {
    slug: '1.5000-in-81-wear', target: '1.500', set: 'inch-81', wear: true, landing: true,
    use: '1-1/2 in with a 0.050 in wear block on each end. Without wear blocks, 1.500 in is the 1 in block plus the 0.500 in block.',
    context: 'Wear blocks consume 0.100 in, so the inside length is 1.400 in. The calculator lists 1.000 + 0.400 + 0.050 + 0.050. Wring the wear blocks on the outside. 0.400 in is in the 0.050 in series, and the 1 in block stays in the middle.',
  },
  {
    slug: '0.7500-in-81-wear', target: '0.750', set: 'inch-81', wear: true, landing: true,
    use: 'Three-quarter inch when both ends of the stack need a wear block. Without wear blocks, 0.750 in is the single 0.750 in block.',
    context: 'The two wear blocks consume 0.100 in, so the inside block is 0.650 in. The calculator lists 0.650 + 0.050 + 0.050. Put the wear blocks on the outside, marked or carbide face out, so the 0.650 in block stays off the work.',
  },
];
