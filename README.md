# trade-pl-statement

### About the application:
This application is a pl statement provider for the "buy" trades completed in the crypto world.
Since, new crypto beginners dont want to invest a lot of capital without testing, this application acts as a simulator
which allows you to add sample trades according to your need, and you can track your PL or Profit and Loss real time.

The system consists of a in depth PL table with real time market prices and pl values. There are multiple pl breakdowns
based on invested coins and the PLs of each over time. There are also quick stats letting you know the best
coin you invested and the worst coin you invested. They are dependant on their current market value and the total cost

Visit the following link for a demo of the application: https://trade-pl-statement.herokuapp.com/

### Basics of the application:
#### Adding trades:
The user can add their "buy" (the system currently only supports buy trades) trades for their respective cryptocoin. 
Note, currently, the system supports 2,000 cryptocurriences and the data is fetched through the following api: https://docs.coincap.io/. 
The user will have the add the traded coin with the traded price, volume (quantity) and finally the trade date.
The added trades can also be edited, except the value of the traded coin. The saved trades are shown in a table with a search filter
that searches the entire table. Hence numbers, text, dates, anything on the table could be searched for.
The trades are stored in your brower's local storage.

#### Viewing PL Statement:
The added trades are firstly combined to create a holding statement. This holding statement has a basic mathematical solution to it.
For multiple trades, same coin, the volume (quantity) is added, whereas the unit cost is taken as the weighted average, which is simply
the addition of total cost of each trade for a coin and divide it to the total quantity of a coin in your current holding. This takes
the unit cost and calculates the total cost based on this unit cost. 

This total cost is compared with the current market value of the coin which simply is
volume * current market price. Note this market price is real time and is retrieved from the following api: https://docs.coincap.io/.  Coming back to the PL statement, 
once the current market value is calculated, the PL is calculated by: current market value - the total cost. This is converted into percentage through: the PL / Total cost.
This is shown in the PL statement table. Also your AUM (assets under management) or net assets with total PL and total PL% is shown in the table.
The table also for each coin shows green and red for +PL and -PL respectively.

This was for the PL statement table. Furthermore, quick stats are provided showing which coin has the greates PL and PL% or simple the highest gainer. Similarly,
the highest loser is shown in the quick stats section.

A bar chart for the PL given by each coin is represented for visual analysis. This chart updates real time.

2 pie charts are also shown. One pie chart is showing each coin's cost vs the total cost. This would give the user
a visual analysis onto which coin currently has the highest investement. The second pie chart shows the current market value
vs the total market value. This allows the user to visualize that which coin has the highest current market value out of the total market value.

Finally, there are multiple line charts portraying each coin's PL from the day the first trade was made for a coin to today's date.
This allows the user to check when was the right time to sell/hold/buy.

Overall the application can act as a simulator for newbies to learn trading and track their capital.
